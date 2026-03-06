import {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import { prisma } from "@/lib/prisma";

const AUTH_FOLDER = "./baileys-auth";

let sock: ReturnType<typeof makeWASocket> | null = null;

async function connect(): Promise<void> {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, console as never),
    },
    printQRInTerminal: true,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log("[Baileys] Scan the QR code above to connect WhatsApp.");
    }
    if (connection === "close") {
      const reason = (lastDisconnect?.error as Boom)?.output?.statusCode;
      const shouldReconnect = reason !== DisconnectReason.loggedOut;
      console.log(`[Baileys] Connection closed (reason: ${reason}). Reconnect: ${shouldReconnect}`);
      if (shouldReconnect) {
        setTimeout(connect, 3000);
      } else {
        console.error("[Baileys] Logged out. Delete baileys-auth/ and restart to re-scan QR.");
      }
    } else if (connection === "open") {
      console.log("[Baileys] WhatsApp connected.");
    }
  });

  // Handle incoming messages for STOP / START
  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    if (type !== "notify") return;
    for (const msg of messages) {
      if (!msg.message || msg.key.fromMe) continue;

      const jid = msg.key.remoteJid;
      if (!jid || !jid.endsWith("@s.whatsapp.net")) continue;

      const phone = jid.replace("@s.whatsapp.net", "");
      const text = (
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ""
      ).trim().toUpperCase();

      if (text === "STOP") {
        const updated = await prisma.subscriber.updateMany({
          where: { phone, verified: true },
          data: { active: false },
        });
        if (updated.count > 0) {
          await sendMessage(phone, "You have paused Yellow Alert. Reply START to resume.");
          console.log(`[Baileys] STOP received from ${phone}`);
        }
      } else if (text === "START") {
        const updated = await prisma.subscriber.updateMany({
          where: { phone, verified: true },
          data: { active: true },
        });
        if (updated.count > 0) {
          await sendMessage(phone, "Yellow Alert resumed. You will receive alerts again.");
          console.log(`[Baileys] START received from ${phone}`);
        }
      }
    }
  });
}

export async function sendMessage(phone: string, text: string): Promise<void> {
  if (!sock) throw new Error("WhatsApp not connected yet");
  const jid = `${phone}@s.whatsapp.net`;
  await sock.sendMessage(jid, { text });
}

export { connect };
