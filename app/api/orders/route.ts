import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

async function getStoreId(userId: string) {
  const member = await prisma.storeMember.findFirst({ where: { userId } })
  return member?.storeId ?? null
}

// GET /api/orders?status=&source=&clientSearch=&from=&to=
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getStoreId(user.id)
  if (!storeId) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const source = searchParams.get("source")
  const clientSearch = searchParams.get("clientSearch")
  const from = searchParams.get("from")
  const to = searchParams.get("to")

  const orders = await prisma.order.findMany({
    where: {
      storeId,
      ...(status ? { status: status as never } : {}),
      ...(source ? { source: source as never } : {}),
      ...(from || to ? {
        createdAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to + "T23:59:59Z") } : {}),
        },
      } : {}),
      ...(clientSearch ? {
        client: {
          OR: [
            { phone: { contains: clientSearch, mode: "insensitive" as never } },
            { name: { contains: clientSearch, mode: "insensitive" as never } },
          ],
        },
      } : {}),
    },
    include: {
      client: { select: { id: true, name: true, phone: true } },
      items: { include: { product: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(orders)
}

const createSchema = z.object({
  clientId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
  })).min(1, "Se requiere al menos un producto"),
  notes: z.string().optional(),
  source: z.enum(["WHATSAPP", "MANUAL"]).default("MANUAL"),
})

// POST /api/orders
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getStoreId(user.id)
  if (!storeId) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const body = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { clientId, items, notes, source } = parsed.data

  // Verify client belongs to store
  const client = await prisma.client.findFirst({ where: { id: clientId, storeId } })
  if (!client) return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 })

  // Load products and check stock
  let total = 0
  const enrichedItems: Array<{ product: { id: string; name: string; price: import("@prisma/client").Prisma.Decimal }, quantity: number }> = []
  for (const item of items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } })
    if (!product) return NextResponse.json({ error: `Producto ${item.productId} no encontrado` }, { status: 404 })
    if (product.stock < item.quantity) {
      return NextResponse.json({ error: `Stock insuficiente para "${product.name}"` }, { status: 400 })
    }
    total += Number(product.price) * item.quantity
    enrichedItems.push({ product, quantity: item.quantity })
  }

  // Create order + items + decrement stock in a transaction
  const order = await prisma.$transaction(async (tx) => {
    const o = await tx.order.create({
      data: {
        storeId,
        clientId,
        total,
        notes: notes ?? null,
        source,
        items: {
          create: enrichedItems.map((i) => ({
            productId: i.product.id,
            quantity: i.quantity,
            unitPrice: i.product.price,
          })),
        },
      },
      include: {
        client: { select: { id: true, name: true, phone: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    })
    for (const i of enrichedItems) {
      await tx.product.update({
        where: { id: i.product.id },
        data: { stock: { decrement: i.quantity } },
      })
    }
    return o
  })

  return NextResponse.json(order, { status: 201 })
}
