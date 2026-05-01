import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

async function getOrCreateDefaultInventory(storeId: string) {
  let inventory = await prisma.inventory.findFirst({ where: { storeId } })
  if (!inventory) {
    inventory = await prisma.inventory.create({
      data: { storeId, name: "Principal" },
    })
  }
  return inventory
}

// GET /api/products — list all products for the current store
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const inventory = await prisma.inventory.findFirst({ where: { storeId: member.storeId } })
  if (!inventory) return NextResponse.json([])

  const products = await prisma.product.findMany({
    where: { inventoryId: inventory.id },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(products)
}

const createSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  price: z.number().positive("El precio debe ser mayor a 0"),
  stock: z.number().int().min(0),
  currency: z.enum(["USD", "BOB"]).default("USD"),
  category: z.string().optional().nullable(),
  lowStockThreshold: z.number().int().min(0).default(5),
  imageUrl: z.string().url().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional().default([]),
})

// POST /api/products — create a product in the store's default inventory
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const inventory = await getOrCreateDefaultInventory(member.storeId)

  const product = await prisma.product.create({
    data: {
      inventoryId: inventory.id,
      name: parsed.data.name,
      price: parsed.data.price,
      stock: parsed.data.stock,
      currency: parsed.data.currency,
      category: parsed.data.category ?? null,
      lowStockThreshold: parsed.data.lowStockThreshold,
      imageUrl: parsed.data.imageUrls?.[0] ?? parsed.data.imageUrl ?? null,
      imageUrls: parsed.data.imageUrls ?? [],
    },
  })

  return NextResponse.json(product, { status: 201 })
}
