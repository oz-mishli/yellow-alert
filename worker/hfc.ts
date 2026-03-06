import { prisma } from "@/lib/prisma";
import { findCity } from "@/lib/cities";
import { distanceKm } from "@/lib/distance";
import { sendMessage } from "./baileys";

const HFC_URL = "https://www.oref.org.il/WarningMessages/alert/alerts.json";
const POLL_INTERVAL_MS = 5000;
const SKIP_SUBSTRINGS = ["הסתיים", "מבזק"];

interface HfcAlert {
  id: string;
  cat: string;
  title: string;
  data: string[]; // affected city names in Hebrew
  desc: string;
}

function shouldSkip(alert: HfcAlert): boolean {
  const haystack = `${alert.title} ${alert.desc}`;
  return SKIP_SUBSTRINGS.some((s) => haystack.includes(s));
}

async function fetchAlert(): Promise<HfcAlert | null> {
  try {
    const res = await fetch(HFC_URL, {
      headers: {
        Referer: "https://www.oref.org.il/",
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });
    const text = (await res.text()).trim();
    if (!text || text === "\r\n" || text.length < 5) return null;
    const data = JSON.parse(text) as HfcAlert;
    if (!data?.id || !Array.isArray(data.data)) return null;
    return data;
  } catch {
    return null;
  }
}

async function dispatchAlert(alert: HfcAlert): Promise<void> {
  const subscribers = await prisma.subscriber.findMany({
    where: { verified: true, active: true, cityLat: { not: null }, cityLng: { not: null } },
  });

  for (const sub of subscribers) {
    // Deduplication: one message per (alertId, phone)
    const already = await prisma.sentAlert.findUnique({
      where: { alertId_phone: { alertId: alert.id, phone: sub.phone } },
    });
    if (already) continue;

    // Find the closest alert city within range
    let closestCity: string | null = null;
    let closestDist = Infinity;

    for (const alertCityName of alert.data) {
      const alertCity = findCity(alertCityName);
      if (!alertCity) continue;
      const dist = distanceKm(
        { lat: sub.cityLat!, lng: sub.cityLng! },
        { lat: alertCity.lat, lng: alertCity.lng }
      );
      if (dist <= sub.rangeKm && dist < closestDist) {
        closestDist = dist;
        closestCity = alertCityName;
      }
    }

    if (!closestCity) continue;

    const distRounded = Math.round(closestDist);
    const message = `Yellow Alert! ${alert.title} in ${closestCity}, approximately ${distRounded} km from your location.`;

    try {
      await sendMessage(sub.phone, message);
      await prisma.sentAlert.create({ data: { alertId: alert.id, phone: sub.phone } });
      console.log(`[HFC] Sent alert to ${sub.phone}: ${message}`);
    } catch (err) {
      console.error(`[HFC] Failed to send to ${sub.phone}:`, err);
    }
  }
}

export function startPoller(): void {
  console.log("[HFC] Poller started — polling every 5 seconds.");
  setInterval(async () => {
    const alert = await fetchAlert();
    if (!alert) return;
    if (shouldSkip(alert)) {
      console.log(`[HFC] Skipped alert: "${alert.title}"`);
      return;
    }
    console.log(`[HFC] New alert: "${alert.title}" in [${alert.data.join(", ")}]`);
    await dispatchAlert(alert);
  }, POLL_INTERVAL_MS);
}
