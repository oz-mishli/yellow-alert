import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("phone");
  if (!raw) return NextResponse.json({ error: "Missing phone" }, { status: 400 });

  const phone = normalizePhone(raw);
  if (!phone) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });

  const sub = await prisma.subscriber.findUnique({ where: { phone } });
  if (!sub) return NextResponse.json({ registered: false });

  return NextResponse.json({
    registered: true,
    cityName: sub.cityName,
    rangeKm: sub.rangeKm,
    active: sub.active,
  });
}

const patchSchema = z.object({
  phone: z.string(),
  active: z.boolean(),
});

export async function PATCH(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });

  await prisma.subscriber.updateMany({
    where: { phone },
    data: { active: parsed.data.active },
  });

  return NextResponse.json({ ok: true, active: parsed.data.active });
}
