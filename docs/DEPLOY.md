# Vendly Deployment Guide

## Architecture

```
Vercel (frontend)  →  Supabase (DB + Realtime)
                          ↑
Railway (backend)  →  Supabase + Stellar + Claude
    ↓  x402 payments
Railway (catalog-service)  →  Supabase
```

## Step 1: Deploy Catalog Service to Railway

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Select the `vendly` repo
3. Set **Root Directory** to `catalog-service`
4. Set these environment variables:

```
CATALOG_STELLAR_PUBLIC=GCABQII55WCX5XP7EJS6TD4OIOAX6ZLFCJ5UFAHH2HMEFYOR7LDIF4SL
STELLAR_NETWORK=testnet
X402_FACILITATOR_URL=https://www.x402.org/facilitator
SUPABASE_URL=https://klfombxxikhsquptyqvf.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
PORT=8081
NODE_ENV=production
```

5. Deploy. Note the generated URL (e.g., `https://vendly-catalog-production-XXXX.up.railway.app`)
6. **Test**: `curl https://<catalog-url>/health` should return `{"healthy":true,...}`

## Step 2: Deploy Backend to Railway

1. In the same Railway project → New Service → Deploy from GitHub repo
2. Select the `vendly` repo
3. Set **Root Directory** to `backend`
4. Set these environment variables:

```
ANTHROPIC_API_KEY=<your-key>
TELEGRAM_BOT_TOKEN=<your-token>
AGENT_STELLAR_SECRET=<your-secret>
AGENT_STELLAR_PUBLIC=GCABQII55WCX5XP7EJS6TD4OIOAX6ZLFCJ5UFAHH2HMEFYOR7LDIF4SL
STELLAR_NETWORK=testnet
STELLAR_RPC_URL=https://soroban-testnet.stellar.org
X402_FACILITATOR_URL=https://www.x402.org/facilitator
SUPABASE_URL=https://klfombxxikhsquptyqvf.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
CATALOG_SERVICE_URL=https://<catalog-url-from-step-1>
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://<vercel-url-from-step-3>
```

> **Note**: Set `FRONTEND_URL` after deploying the frontend (Step 3). You can update it later.

5. Deploy. Note the generated URL (e.g., `https://vendly-backend-production-XXXX.up.railway.app`)
6. **Test**: `curl https://<backend-url>/health` should return `{"healthy":true,...}`

## Step 3: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → Import Git Repository
2. Select the `vendly` repo
3. Set **Root Directory** to `frontend`
4. Framework Preset: **Next.js** (auto-detected)
5. Set these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://klfombxxikhsquptyqvf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
NEXT_PUBLIC_BUSINESS_ID=dc936bab-2b83-4f75-af5a-d6932095bf1c
NEXT_PUBLIC_STELLAR_PUBLIC_KEY=GCABQII55WCX5XP7EJS6TD4OIOAX6ZLFCJ5UFAHH2HMEFYOR7LDIF4SL
NEXT_PUBLIC_STELLAR_NETWORK=testnet
```

6. Deploy. Note the URL (e.g., `https://vendly.vercel.app` or `https://vendly-XXXX.vercel.app`)

## Step 4: Update Backend CORS

Go back to Railway backend service and update:
```
FRONTEND_URL=https://<your-vercel-url>
```
Redeploy the backend.

## Step 5: Set Telegram Webhook

From the `backend/` directory, run:

```bash
WEBHOOK_URL=https://<backend-railway-url> npm run webhook:set
```

This registers your Railway backend as the Telegram webhook handler.

**To verify:**
```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Should show your Railway URL as the webhook.

## Step 6: Integration Test

1. **Health checks:**
   ```bash
   curl https://<backend-url>/health
   curl https://<catalog-url>/health
   ```

2. **Telegram bot:** Send a message to `@vendly_sales_bot` — should get a reply

3. **Dashboard:** Open `https://<vercel-url>` — should show wallet balance and transactions

4. **x402 paywall:** 
   ```bash
   curl -X POST https://<backend-url>/api/inference
   # Should return 402 Payment Required
   ```

5. **Catalog paywall:**
   ```bash
   curl https://<catalog-url>/api/products
   # Should return 402 Payment Required
   ```

## Switching Back to Dev Mode

To switch the bot back to local long-polling (dev mode):

```bash
cd backend
npm run webhook:delete
npm run dev
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Bot not responding after deploy | Check webhook is set: `getWebhookInfo` |
| Bot responds locally but not on Railway | Make sure `NODE_ENV=production` is set |
| CORS errors on dashboard | Update `FRONTEND_URL` env var on Railway backend |
| Catalog service unreachable | Check `CATALOG_SERVICE_URL` points to Railway URL (not localhost) |
| 402 on catalog but fallback works | Expected — x402 payments need USDC in wallet |
| Supabase Realtime not working | Check RLS policies allow `anon` role to SELECT on `transactions` |
