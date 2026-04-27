import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().optional(),
  country: z.string().optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  // Verify user owns this store
  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId: user.id, storeId: id } },
  })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const store = await prisma.store.update({
    where: { id },
    data: parsed.data,
  })

  return NextResponse.json(store)
}
