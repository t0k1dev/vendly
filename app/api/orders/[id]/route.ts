import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

async function getOrder(orderId: string, storeId: string) {
  return prisma.order.findFirst({
    where: { id: orderId, storeId },
    include: {
      client: { select: { id: true, name: true, phone: true, location: true } },
      items: {
        include: { product: { select: { id: true, name: true, currency: true } } },
      },
    },
  })
}

// GET /api/orders/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const order = await getOrder(id, member.storeId)
  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

  return NextResponse.json(order)
}

const updateSchema = z.object({
  status: z.enum(["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO", "CANCELADO"]).optional(),
  notes: z.string().optional().nullable(),
})

// PATCH /api/orders/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const existing = await getOrder(id, member.storeId)
  if (!existing) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.order.update({ where: { id }, data: parsed.data })
  return NextResponse.json(updated)
}

// DELETE /api/orders/[id]
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const existing = await getOrder(id, member.storeId)
  if (!existing) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

  await prisma.orderItem.deleteMany({ where: { orderId: id } })
  await prisma.order.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
