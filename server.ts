/**
 * Custom Next.js server that also starts the background worker in the same process.
 * This lets the API routes and the worker share the same Baileys socket instance.
 *
 * Usage: npx tsx server.ts
 */
import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { connect, sendMessage } from "./worker/baileys";
import { startPoller } from "./worker/hfc";
import { registerSendMessage as registerForOtp } from "./app/api/otp/send/route";
import { registerSendMessage as registerForSubscribe } from "./app/api/subscribe/route";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Start Baileys and inject sendMessage into API routes
  await connect();

  // Inject Baileys sendMessage into API route handlers
  registerForOtp(sendMessage);
  registerForSubscribe(sendMessage);

  // Start HFC poller after giving Baileys time to connect
  setTimeout(() => startPoller(), 5000);

  const port = parseInt(process.env.PORT ?? "3000", 10);
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`[Server] Yellow Alert running on http://localhost:${port}`);
  });
});
