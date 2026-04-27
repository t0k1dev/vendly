import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  storeId: z.string(),
  phoneNumberId: z.string().min(1, "Phone Number ID requerido"),
  token: z.string().min(1, "Token requerido"),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { storeId, phoneNumberId, token } = parsed.data

  // Verify ownership
  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId: user.id, storeId } },
  })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  // Validate credentials against Meta API
  const metaRes = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )

  if (!metaRes.ok) {
    return NextResponse.json(
      { error: "Credenciales de WhatsApp inválidas. Verifica el Phone Number ID y el Token." },
      { status: 400 }
    )
  }

  // Upsert WhatsApp session
  const session = await prisma.whatsAppSession.upsert({
    where: { storeId },
    create: { storeId, phoneNumberId, token, connected: true },
    update: { phoneNumberId, token, connected: true },
  })

  return NextResponse.json(session)
}
