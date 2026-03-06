import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { findCity } from "@/lib/cities";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  phone: z.string(),
  cityName: z.string().min(1),
  rangeKm: z.number().int().min(1).max(200),
});

let _sendMessage: ((phone: string, text: string) => Promise<void>) | null = null;

export function registerSendMessage(fn: (phone: string, text: string) => Promise<void>) {
  _sendMessage = fn;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const subscriber = await prisma.subscriber.findUnique({ where: { phone } });
  if (!subscriber?.verified) {
    return NextResponse.json({ error: "Phone not verified" }, { status: 403 });
  }

  const city = findCity(parsed.data.cityName);
  if (!city) {
    return NextResponse.json({ error: "Unknown city" }, { status: 400 });
  }

  await prisma.subscriber.update({
    where: { phone },
    data: {
      cityName: city.name,
      cityLat: city.lat,
      cityLng: city.lng,
      rangeKm: parsed.data.rangeKm,
      active: true,
    },
  });

  const confirmMsg =
    `You are now subscribed to Yellow Alert for ${city.name} with a range of ${parsed.data.rangeKm} km. ` +
    `Reply STOP to pause alerts.`;

  if (_sendMessage) {
    await _sendMessage(phone, confirmMsg).catch((err) =>
      console.error("[Subscribe] Failed to send confirmation:", err)
    );
  }

  return NextResponse.json({ ok: true });
}
