import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const inventory = await prisma.inventory.findUnique({ where: { id } })
  if (!inventory) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const member = await prisma.storeMember.findUnique({
    where: { userId_storeId: { userId: user.id, storeId: inventory.storeId } },
  })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const products = await prisma.product.findMany({
    where: { inventoryId: id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(products)
}
