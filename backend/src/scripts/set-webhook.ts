/**
 * Set Telegram webhook to production URL.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=<token> WEBHOOK_URL=<url> npx tsx src/scripts/set-webhook.ts
 *
 * Example:
 *   TELEGRAM_BOT_TOKEN=8606... WEBHOOK_URL=https://vendly-backend.up.railway.app npx tsx src/scripts/set-webhook.ts
 */
import "dotenv/config";

const token = process.env.TELEGRAM_BOT_TOKEN;
const webhookBaseUrl = process.env.WEBHOOK_URL;

if (!token) {
  console.error("Missing TELEGRAM_BOT_TOKEN");
  process.exit(1);
}

if (!webhookBaseUrl) {
  console.error("Missing WEBHOOK_URL (e.g. https://vendly-backend.up.railway.app)");
  process.exit(1);
}

const webhookUrl = `${webhookBaseUrl.replace(/\/$/, "")}/telegram/webhook`;

async function setWebhook() {
  console.log(`Setting webhook to: ${webhookUrl}`);

  const res = await fetch(
    `https://api.telegram.org/bot${token}/setWebhook`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: true,
      }),
    }
  );

  const data = await res.json();

  if (data.ok) {
    console.log("Webhook set successfully!");
    console.log(`URL: ${webhookUrl}`);
  } else {
    console.error("Failed to set webhook:", data);
    process.exit(1);
  }
}

async function getWebhookInfo() {
  const res = await fetch(
    `https://api.telegram.org/bot${token}/getWebhookInfo`
  );
  const data = await res.json();
  console.log("\nCurrent webhook info:");
  console.log(JSON.stringify(data.result, null, 2));
}

await setWebhook();
await getWebhookInfo();
