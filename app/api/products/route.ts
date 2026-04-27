import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

const schema = z.object({
  storeId: z.string(),
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  stock: z.number().int().min(0),
  currency: z.enum(["USD", "BOB"]).default("USD"),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { storeId, name, price, stock, currency } = parsed.data

  // Verify ownership
  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId: user.id, storeId } },
  })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  // Get or create default inventory for store
  let inventory = await prisma.inventory.findFirst({ where: { storeId } })
  if (!inventory) {
    inventory = await prisma.inventory.create({
      data: { storeId, name: "Principal" },
    })
  }

  const product = await prisma.product.create({
    data: { inventoryId: inventory.id, name, price, stock, currency },
  })

  return NextResponse.json(product, { status: 201 })
}
