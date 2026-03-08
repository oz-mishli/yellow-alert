import { NextResponse } from "next/server";
import { CITIES } from "@/lib/cities";

export async function GET() {
  const names = CITIES.map((c) => c.name).sort((a, b) => a.localeCompare(b, "he"));
  return NextResponse.json(names);
}
