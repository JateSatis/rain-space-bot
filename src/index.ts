import dotenv from "dotenv";
dotenv.config();

import { startPolling } from "./polling";

if (!process.env.BOT_TOKEN) {
  console.error("[BOT] BOT_TOKEN is not set — exiting");
  process.exit(1);
}

console.log(`[BOT] Telegram base: ${process.env.TELEGRAM_API_BASE ?? "https://api.telegram.org"}`);
console.log(`[BOT] Mini App URL: ${process.env.MINI_APP_URL ?? "(not set)"}`);

startPolling().catch((err) => {
  console.error("[BOT] Fatal error:", String(err));
  process.exit(1);
});
