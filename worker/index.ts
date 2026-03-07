import "dotenv/config";
import { startPoller } from "./hfc";

async function main() {
  console.log("[Worker] Starting Yellow Alert worker...");
  startPoller();
}

main().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
