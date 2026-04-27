import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  await prisma.whatsAppSession.updateMany({
    where: { storeId: member.storeId },
    data: { connected: false },
  })

  return NextResponse.json({ success: true })
}
