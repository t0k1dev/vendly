import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { prisma } = await import("@/lib/prisma")

  const member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
    include: { store: true },
  })

  if (!member) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 })
  }

  return NextResponse.json({ store: member.store, role: member.role })
}
