import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const businessHoursSchema = z.record(
  z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  z.object({
    open: z.string(),
    close: z.string(),
    enabled: z.boolean(),
  })
)

const patchSchema = z.object({
  salutation: z.string().min(1).optional(),
  farewell: z.string().optional(),
  tone: z.enum(["FORMAL", "INFORMAL"]).optional(),
  outOfHoursMsg: z.string().optional(),
  businessHours: businessHoursSchema.optional(),
})

async function getStoreId(userId: string) {
  const member = await prisma.storeMember.findFirst({ where: { userId } })
  return member?.storeId ?? null
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getStoreId(user.id)
  if (!storeId) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const config = await prisma.agentConfig.findUnique({ where: { storeId } })

  // Auto-create with defaults if missing
  if (!config) {
    const created = await prisma.agentConfig.create({ data: { storeId } })
    return NextResponse.json(created)
  }

  return NextResponse.json(config)
}

export async function PATCH(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getStoreId(user.id)
  if (!storeId) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const body = await request.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const config = await prisma.agentConfig.upsert({
    where: { storeId },
    create: { storeId, ...parsed.data },
    update: parsed.data,
  })

  return NextResponse.json(config)
}
