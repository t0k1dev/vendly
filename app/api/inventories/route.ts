import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

async function getCurrentStore(userId: string) {
  const member = await prisma.storeMember.findFirst({ where: { userId } })
  return member?.storeId ?? null
}

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getCurrentStore(user.id)
  if (!storeId) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const inventories = await prisma.inventory.findMany({
    where: { storeId, status: "ACTIVE" },
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(inventories)
}

const createSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getCurrentStore(user.id)
  if (!storeId) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const inventory = await prisma.inventory.create({
    data: { storeId, name: parsed.data.name },
  })

  return NextResponse.json(inventory, { status: 201 })
}
