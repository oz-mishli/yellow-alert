/**
 * Custom Next.js server that co-starts the HFC background worker.
 * Usage: npm run dev  (runs via tsx server.ts)
 */
import "dotenv/config";
import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { startPoller } from "./worker/hfc";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  startPoller();

  const port = parseInt(process.env.PORT ?? "3000", 10);
  createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`[Server] Yellow Alert running on http://localhost:${port}`);
  });
});
