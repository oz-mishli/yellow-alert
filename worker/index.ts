import "dotenv/config";
import { connect } from "./baileys";
import { startPoller } from "./hfc";

async function main() {
  console.log("[Worker] Starting Yellow Alert worker...");
  await connect();
  // Give Baileys a moment to finish connecting before polling starts
  setTimeout(() => {
    startPoller();
  }, 5000);
}

main().catch((err) => {
  console.error("[Worker] Fatal error:", err);
  process.exit(1);
});
