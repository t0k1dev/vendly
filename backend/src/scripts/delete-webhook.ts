/**
 * Delete Telegram webhook (switch back to long-polling for dev).
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=<token> npx tsx src/scripts/delete-webhook.ts
 */
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

async function deleteWebhook() {
  console.log("Deleting webhook...");

  const res = await fetch(
    `https://api.telegram.org/bot${token}/deleteWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ drop_pending_updates: true }),
    }
  );

  const data = await res.json();

  if (data.ok) {
    console.log("Webhook deleted. Bot can now use long-polling (dev mode).");
  } else {
    console.error("Failed to delete webhook:", data);
    process.exit(1);
  }
}

await deleteWebhook();
