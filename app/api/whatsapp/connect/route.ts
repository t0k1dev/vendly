import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  phoneNumberId: z.string().min(1, "Phone Number ID requerido"),
  token: z.string().min(1, "Token requerido"),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
  const storeId = member.storeId

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { phoneNumberId, token } = parsed.data

  // Validate credentials against Meta API
  const metaRes = await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  )
  if (!metaRes.ok) {
    return NextResponse.json(
      { error: "Credenciales inválidas. Verifica el Phone Number ID y el Token." },
      { status: 400 }
    )
  }

  const session = await prisma.whatsAppSession.upsert({
    where: { storeId },
    create: { storeId, phoneNumberId, token, connected: true },
    update: { phoneNumberId, token, connected: true },
  })

  return NextResponse.json({ phoneNumberId: session.phoneNumberId, connected: session.connected })
}
