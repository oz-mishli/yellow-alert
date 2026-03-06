import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/phone";
import { createOtp } from "@/lib/otp";

const schema = z.object({ phone: z.string().min(9) });

// Baileys sendMessage is only available in the worker process.
// In the Next.js process we call it by requiring the same module —
// but since Baileys runs in the worker, we write the message via a shared helper.
// For the alpha (single machine), we import worker/baileys directly.
// NOTE: This means `next dev` and `worker` share the same Baileys session file;
// run them in separate processes but they can't share the live socket.
// Solution: the API writes a pending OTP to DB; the worker picks it up and sends it.
// For simplicity in alpha, we run Next.js and the worker in the same Node process
// via a custom server — or we accept that OTP sending is done by the worker polling DB.
//
// Simple alpha approach: write a pending OTP send request to DB and have the worker
// send it. But that adds latency. Instead, we keep Baileys in a separate singleton
// importable from both — works as long as Next.js and worker run in the same process.
//
// For `next dev` + separate worker: OTP sending must go through the worker.
// We solve this by exposing an internal API endpoint the worker calls — but that's complex.
//
// Pragmatic alpha decision: run everything via a single custom Next.js server
// that also starts the worker. See server.ts.

let _sendMessage: ((phone: string, text: string) => Promise<void>) | null = null;

export function registerSendMessage(fn: (phone: string, text: string) => Promise<void>) {
  _sendMessage = fn;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: "Not a valid Israeli mobile number" }, { status: 400 });
  }

  const code = await createOtp(phone);

  // Send via the registered Baileys sender (injected by server.ts)
  if (_sendMessage) {
    await _sendMessage(phone, `Your Yellow Alert verification code is: ${code}\nExpires in 5 minutes.`);
  } else {
    // Fallback: log to console (useful during early dev before Baileys is wired)
    console.log(`[OTP] Code for ${phone}: ${code}`);
  }

  return NextResponse.json({ ok: true });
}
