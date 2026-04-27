import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ session: null })

  const session = await prisma.whatsAppSession.findUnique({ where: { storeId: member.storeId } })
  if (!session) return NextResponse.json({ session: null })

  return NextResponse.json({
    session: { phoneNumberId: session.phoneNumberId, connected: session.connected },
  })
}
