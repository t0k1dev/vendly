import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { paymentMiddleware } from "@x402/hono";
import { webhookCallback } from "grammy";
import { env } from "./config/env.js";
import { bot } from "./bot/telegram.js";
import { resourceServer, routeConfig } from "./x402/server.js";
import { inferenceRoutes } from "./services/inference.js";

const app = new Hono();

// --- Middleware ---
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", env.FRONTEND_URL],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-PAYMENT"],
  })
);

// --- Free routes (before x402 middleware) ---
app.get("/", (c) => c.json({ service: "vendly-backend", status: "ok" }));
app.get("/health", (c) =>
  c.json({ healthy: true, timestamp: new Date().toISOString() })
);

// Webhook route only in production — dev uses long-polling via bot.start()
if (process.env.NODE_ENV === "production") {
  app.post("/telegram/webhook", webhookCallback(bot, "hono"));
}

app.get("/api/status", (c) =>
  c.json({
    agent: "vendly",
    network: `stellar:${env.STELLAR_NETWORK}`,
    publicKey: env.AGENT_STELLAR_PUBLIC,
    catalogService: env.CATALOG_SERVICE_URL,
    frontendUrl: env.FRONTEND_URL,
    nodeEnv: env.NODE_ENV,
  })
);

// Debug endpoint — test each dependency
app.get("/api/debug", async (c) => {
  const results: Record<string, unknown> = {};

  // Test Supabase
  try {
    const { getDemoBusinessId } = await import("./db/supabase.js");
    const bizId = await getDemoBusinessId();
    results.supabase = { ok: true, businessId: bizId };
  } catch (e) {
    results.supabase = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Test Stellar balance
  try {
    const { getWalletBalance } = await import("./services/wallet.js");
    const balance = await getWalletBalance();
    results.stellar = { ok: true, usdc: balance.usdc, xlm: balance.xlm };
  } catch (e) {
    results.stellar = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Test catalog service
  try {
    const { getCatalogData } = await import("./services/catalog.js");
    const catalog = await getCatalogData();
    results.catalog = { ok: true, length: catalog.length };
  } catch (e) {
    results.catalog = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  // Test Claude
  try {
    const { getAgentResponse } = await import("./agent/sales-agent.js");
    const reply = await getAgentResponse([], "test", "No products");
    results.claude = { ok: true, replyLength: reply.length };
  } catch (e) {
    results.claude = { ok: false, error: e instanceof Error ? e.message : String(e) };
  }

  return c.json(results);
});

// --- x402 payment middleware (applies to routes in routeConfig) ---
app.use("*", paymentMiddleware(routeConfig, resourceServer));

// --- x402-protected routes ---
app.route("/api/inference", inferenceRoutes);

// --- Start server ---
const isDev = process.env.NODE_ENV !== "production";

if (isDev) {
  console.log("Starting bot in long-polling mode (development)...");
  bot.start();
}

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`\nVendly backend running on http://localhost:${info.port}`);
  console.log(`Stellar network: stellar:${env.STELLAR_NETWORK}`);
  console.log(`Agent wallet: ${env.AGENT_STELLAR_PUBLIC}`);
  console.log(`Catalog service: ${env.CATALOG_SERVICE_URL}`);
  console.log(`\nx402-protected routes:`);
  Object.entries(routeConfig).forEach(([route, config]) => {
    console.log(`  ${route} — ${config.accepts.price}`);
  });
  if (isDev) {
    console.log("\nTelegram bot running in long-polling mode");
    console.log("Send /start to your bot to test!");
  } else {
    console.log(`\nTelegram webhook: POST /telegram/webhook`);
  }
});
