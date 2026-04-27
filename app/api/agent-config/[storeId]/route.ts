import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  salutation: z.string().min(1).optional(),
  farewell: z.string().optional(),
  tone: z.enum(["FORMAL", "INFORMAL"]).optional(),
  outOfHoursMsg: z.string().optional(),
})

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId: user.id, storeId } },
  })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const config = await prisma.agentConfig.upsert({
    where: { storeId },
    create: { storeId, ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.json(config)
}
