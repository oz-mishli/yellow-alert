import { NextRequest, NextResponse } from "next/server";
import { normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("phone");
  if (!raw) return NextResponse.json({ error: "Missing phone" }, { status: 400 });

  const phone = normalizePhone(raw);
  if (!phone) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });

  const sub = await prisma.subscriber.findUnique({ where: { phone } });
  if (!sub || !sub.verified) {
    return NextResponse.json({ verified: false });
  }

  return NextResponse.json({
    verified: true,
    cityName: sub.cityName,
    rangeKm: sub.rangeKm,
    active: sub.active,
  });
}
