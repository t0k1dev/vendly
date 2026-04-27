import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

async function verifyInventoryOwnership(userId: string, inventoryId: string) {
  const inventory = await prisma.inventory.findUnique({ where: { id: inventoryId } })
  if (!inventory) return null
  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId, storeId: inventory.storeId } },
  })
  return member ? inventory : null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const inventory = await verifyInventoryOwnership(user.id, id)
  if (!inventory) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const schema = z.object({ name: z.string().min(1).optional() })
  const parsed = schema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await prisma.inventory.update({ where: { id }, data: parsed.data })
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

  const inventory = await verifyInventoryOwnership(user.id, id)
  if (!inventory) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  // Soft delete — archive instead of hard delete
  const archived = await prisma.inventory.update({
    where: { id },
    data: { status: "ARCHIVED" },
  })
  return NextResponse.json(archived)
}
