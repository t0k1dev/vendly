import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

async function verifyProductOwnership(userId: string, productId: string) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { inventory: true },
  })
  if (!product) return null
  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId, storeId: product.inventory.storeId } },
  })
  return member ? product : null
}

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  currency: z.enum(["USD", "BOB"]).optional(),
  category: z.string().optional(),
  imageUrl: z.string().url().optional().nullable(),
  imageUrls: z.array(z.string().url()).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const product = await verifyProductOwnership(user.id, id)
  if (!product) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const parsed = updateSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { imageUrls, imageUrl, ...rest } = parsed.data
  const updateData = {
    ...rest,
    ...(imageUrls !== undefined && {
      imageUrls,
      imageUrl: imageUrls[0] ?? null,
    }),
    ...(imageUrls === undefined && imageUrl !== undefined && { imageUrl }),
  }
  const updated = await prisma.product.update({ where: { id }, data: updateData })
  return NextResponse.json(updated)
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const product = await verifyProductOwnership(user.id, id)
  if (!product) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  await prisma.orderItem.deleteMany({ where: { productId: id } })
  await prisma.product.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
