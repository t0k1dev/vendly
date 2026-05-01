import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/categories — unique non-null product categories for the current store
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json([], { status: 200 })

  const inventory = await prisma.inventory.findFirst({ where: { storeId: member.storeId } })
  if (!inventory) return NextResponse.json([], { status: 200 })

  const rows = await prisma.product.findMany({
    where: { inventoryId: inventory.id, category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  })

  const categories = rows.map((r) => r.category as string)
  return NextResponse.json(categories)
}
