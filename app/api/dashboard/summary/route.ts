import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

function periodRange(period: string): { gte: Date; lte: Date } {
  const now = new Date()
  const lte = new Date(now)
  const gte = new Date(now)

  if (period === "today") {
    gte.setHours(0, 0, 0, 0)
    lte.setHours(23, 59, 59, 999)
  } else if (period === "week") {
    const day = now.getDay()
    gte.setDate(now.getDate() - day)
    gte.setHours(0, 0, 0, 0)
  } else {
    // month (default)
    gte.setDate(1)
    gte.setHours(0, 0, 0, 0)
  }

  return { gte, lte }
}

// GET /api/dashboard/summary?period=today|week|month
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
  const storeId = member.storeId

  const { searchParams } = new URL(request.url)
  const period = searchParams.get("period") ?? "month"
  const range = periodRange(period)
  const monthRange = periodRange("month")
  const weekRange = periodRange("week")

  // 1. Sales revenue (ENTREGADO orders in period)
  const deliveredOrders = await prisma.order.findMany({
    where: { storeId, status: "ENTREGADO", createdAt: range },
    select: { total: true },
  })
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0)

  // 2. Orders by status (all time)
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    where: { storeId },
    _count: { id: true },
  })
  const statusMap: Record<string, number> = {}
  for (const row of ordersByStatus) statusMap[row.status] = row._count.id

  // 3. Top 5 products this month (non-cancelled)
  const topItems = await prisma.orderItem.findMany({
    where: {
      order: {
        storeId,
        status: { not: "CANCELADO" },
        createdAt: monthRange,
      },
    },
    select: { productId: true, quantity: true, product: { select: { name: true } } },
  })
  const productTotals: Record<string, { name: string; qty: number }> = {}
  for (const item of topItems) {
    if (!productTotals[item.productId]) {
      productTotals[item.productId] = { name: item.product.name, qty: 0 }
    }
    productTotals[item.productId].qty += item.quantity
  }
  const topProducts = Object.entries(productTotals)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5)
    .map(([id, v]) => ({ id, name: v.name, qty: v.qty }))

  // 4. New clients
  const newClientsWeek = await prisma.client.count({ where: { storeId, createdAt: weekRange } })
  const newClientsMonth = await prisma.client.count({ where: { storeId, createdAt: monthRange } })

  // 5. Activity feed — last 10 events from orders + clients
  const recentOrders = await prisma.order.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      status: true,
      createdAt: true,
      source: true,
      client: { select: { name: true, phone: true } },
    },
  })
  const recentClients = await prisma.client.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { id: true, name: true, phone: true, createdAt: true },
  })

  type ActivityEvent = {
    type: "order" | "client"
    label: string
    createdAt: Date
    id: string
  }

  const activity: ActivityEvent[] = [
    ...recentOrders.map((o) => ({
      type: "order" as const,
      label: `Nueva orden de ${o.client.name ?? o.client.phone}`,
      createdAt: o.createdAt,
      id: o.id,
    })),
    ...recentClients.map((c) => ({
      type: "client" as const,
      label: `Nuevo cliente: ${c.name ?? c.phone}`,
      createdAt: c.createdAt,
      id: c.id,
    })),
  ]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)

  return NextResponse.json({
    revenue: totalRevenue,
    period,
    ordersByStatus: statusMap,
    topProducts,
    newClientsWeek,
    newClientsMonth,
    activity: activity.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
  })
}
