import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"
import { runAgent } from "@/lib/agent"
import { sendWhatsAppMessage } from "@/lib/whatsapp"

// ─── GET: Meta webhook verification ──────────────────────────────────────────

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }

  return new Response("Forbidden", { status: 403 })
}

// ─── POST: Incoming messages ──────────────────────────────────────────────────

export async function POST(request: Request) {
  // 1. Verify HMAC-SHA256 signature
  const rawBody = await request.text()
  const signature = request.headers.get("x-hub-signature-256") ?? ""
  const appSecret = process.env.WHATSAPP_APP_SECRET ?? ""

  if (appSecret) {
    const expected = "sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex")
    try {
      const sigBuf = Buffer.from(signature)
      const expBuf = Buffer.from(expected)
      if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) {
        return new Response("Forbidden", { status: 403 })
      }
    } catch {
      return new Response("Forbidden", { status: 403 })
    }
  }

  // 2. Parse payload
  let payload: WhatsAppPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return new Response("Bad Request", { status: 400 })
  }

  // 3. Respond 200 immediately — process async
  processWebhook(payload).catch((err) =>
    console.error("[whatsapp webhook] async processing error:", err)
  )

  return new Response("OK", { status: 200 })
}

// ─── Async processing ─────────────────────────────────────────────────────────

async function processWebhook(payload: WhatsAppPayload) {
  const entry = payload.entry?.[0]
  const change = entry?.changes?.[0]
  const value = change?.value

  if (!value?.messages?.length) return // status updates, etc.

  const phoneNumberId: string = value.metadata?.phone_number_id ?? ""
  if (!phoneNumberId) return
  const msg = value.messages[0]
  const senderPhone: string = msg.from
  const msgType: string = msg.type

  // Only handle text for now; log others
  if (msgType !== "text") {
    console.log(`[whatsapp] unsupported message type: ${msgType} from ${senderPhone}`)
    return
  }

  const content: string = msg.text?.body ?? ""

  // 4. Find store by phoneNumberId
  const session = await prisma.whatsAppSession.findFirst({
    where: { phoneNumberId },
  })
  if (!session) {
    console.log(`[whatsapp] no store found for phoneNumberId: ${phoneNumberId}`)
    return
  }
  const storeId = session.storeId

  // 5. Auto-register client if new
  await prisma.client.upsert({
    where: { storeId_phone: { storeId, phone: senderPhone } },
    create: { storeId, phone: senderPhone },
    update: {},
  })

  // 6. Save inbound message
  await prisma.message.create({
    data: { storeId, clientPhone: senderPhone, direction: "IN", type: "TEXT", content },
  })

  // 7. Run agent
  const reply = await runAgent({ storeId, clientPhone: senderPhone, message: content })

  // 8. Save outbound message
  await prisma.message.create({
    data: { storeId, clientPhone: senderPhone, direction: "OUT", type: "TEXT", content: reply },
  })

  // 9. Send reply via Meta Cloud API
  await sendWhatsAppMessage({ to: senderPhone, message: reply, token: session.token, phoneNumberId })
}

// ─── Types ────────────────────────────────────────────────────────────────────

type WhatsAppPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        metadata?: { phone_number_id: string }
        messages?: Array<{
          from: string
          type: string
          text?: { body: string }
        }>
      }
    }>
  }>
}
