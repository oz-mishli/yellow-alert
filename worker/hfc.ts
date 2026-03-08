import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { prisma } from "@/lib/prisma";
import { findCity } from "@/lib/cities";
import { distanceKm } from "@/lib/distance";

const expo = new Expo();
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
    where: {
      active: true,
      expoPushToken: { not: null },
      cityLat: { not: null },
      cityLng: { not: null },
    },
  });

  const messages: ExpoPushMessage[] = [];
  const toMark: string[] = [];

  for (const sub of subscribers) {
    const already = await prisma.sentAlert.findUnique({
      where: { alertId_phone: { alertId: alert.id, phone: sub.phone } },
    });
    if (already) continue;

    if (!Expo.isExpoPushToken(sub.expoPushToken!)) continue;

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
    messages.push({
      to: sub.expoPushToken!,
      sound: "default",
      title: "Yellow Alert",
      body: `${alert.title} in ${closestCity}, approximately ${distRounded} km from your location.`,
      data: { alertId: alert.id },
    });
    toMark.push(sub.phone);
  }

  if (messages.length === 0) return;

  const chunks = expo.chunkPushNotifications(messages);
  for (const chunk of chunks) {
    try {
      const receipts = await expo.sendPushNotificationsAsync(chunk);
      receipts.forEach((r) => {
        if (r.status === "error") {
          console.error("[HFC] Push error:", r.message, r.details);
        }
      });
    } catch (err) {
      console.error("[HFC] Failed to send push chunk:", err);
    }
  }

  for (const phone of toMark) {
    await prisma.sentAlert.create({ data: { alertId: alert.id, phone } }).catch(() => {});
  }

  console.log(`[HFC] Dispatched "${alert.title}" to ${toMark.length} subscriber(s).`);
}

export function startPoller(): void {
  console.log("[HFC] Poller started — polling every 5 seconds.");
  setInterval(async () => {
    const alert = await fetchAlert();
    if (!alert) return;
    if (shouldSkip(alert)) {
      console.log(`[HFC] Skipped: "${alert.title}"`);
      return;
    }
    console.log(`[HFC] New alert: "${alert.title}" in [${alert.data.join(", ")}]`);
    await dispatchAlert(alert);
  }, POLL_INTERVAL_MS);
}
