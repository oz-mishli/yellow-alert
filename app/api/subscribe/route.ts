import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { findCity } from "@/lib/cities";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  phone: z.string(),
  expoPushToken: z.string().min(1),
  cityName: z.string().min(1),
  rangeKm: z.number().int().min(1).max(200),
});

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

  const city = findCity(parsed.data.cityName);
  if (!city) {
    return NextResponse.json({ error: "Unknown city" }, { status: 400 });
  }

  await prisma.subscriber.upsert({
    where: { phone },
    update: {
      expoPushToken: parsed.data.expoPushToken,
      cityName: city.name,
      cityLat: city.lat,
      cityLng: city.lng,
      rangeKm: parsed.data.rangeKm,
      active: true,
    },
    create: {
      phone,
      expoPushToken: parsed.data.expoPushToken,
      cityName: city.name,
      cityLat: city.lat,
      cityLng: city.lng,
      rangeKm: parsed.data.rangeKm,
    },
  });

  return NextResponse.json({ ok: true });
}
