import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId: user.id, storeId: id } },
  })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const store = await prisma.store.update({
    where: { id },
    data: { onboardingCompleted: true },
  })

  return NextResponse.json(store)
}
