import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"

// GET /api/orders/export — download CSV
export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new Response("No autorizado", { status: 401 })

  const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
  if (!member) return new Response("No autorizado", { status: 403 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const source = searchParams.get("source")

  const orders = await prisma.order.findMany({
    where: {
      storeId: member.storeId,
      ...(status ? { status: status as never } : {}),
      ...(source ? { source: source as never } : {}),
    },
    include: {
      client: { select: { name: true, phone: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  })

  const rows = [
    ["ID", "Fecha", "Cliente", "Teléfono", "Estado", "Origen", "Productos", "Total"].join(","),
    ...orders.map((o) => [
      o.id,
      o.createdAt.toISOString(),
      `"${o.client.name ?? ""}"`,
      o.client.phone,
      o.status,
      o.source,
      `"${o.items.map((i) => `${i.product.name} x${i.quantity}`).join("; ")}"`,
      o.total,
    ].join(",")),
  ]

  return new Response(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos-${Date.now()}.csv"`,
    },
  })
}
