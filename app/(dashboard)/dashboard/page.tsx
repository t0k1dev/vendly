"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
}

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
}

type Summary = {
  revenue: number
  period: string
  ordersByStatus: Record<string, number>
  topProducts: Array<{ id: string; name: string; qty: number }>
  newClientsWeek: number
  newClientsMonth: number
  activity: Array<{ type: string; label: string; createdAt: string; id: string }>
}

export default function DashboardPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<Summary | null>(null)
  const [period, setPeriod] = useState<"today" | "week" | "month">("month")
  const [loading, setLoading] = useState(true)

  const fetchSummary = useCallback(async (p: string) => {
    setLoading(true)
    const res = await fetch(`/api/dashboard/summary?period=${p}`)
    if (res.ok) setSummary(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { fetchSummary(period) }, [period, fetchSummary])

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const PERIOD_LABELS = { today: "Hoy", week: "Esta semana", month: "Este mes" }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/products")}>Productos</Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/orders")}>Pedidos</Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/clients")}>Clientes</Button>
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/settings/whatsapp")}>WhatsApp</Button>
          <Button size="sm" variant="outline" onClick={handleLogout}>Salir</Button>
        </div>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {(["today", "week", "month"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-5 h-24 animate-pulse bg-gray-50" /></Card>
          ))}
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Top metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-500 mb-1">Ingresos ({PERIOD_LABELS[period]})</p>
                <p className="text-2xl font-bold">${summary.revenue.toFixed(2)}</p>
                <p className="text-xs text-gray-400 mt-1">Solo pedidos entregados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-500 mb-1">Pedidos pendientes</p>
                <p className="text-2xl font-bold">{summary.ordersByStatus["PENDIENTE"] ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">Requieren atención</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-500 mb-1">Clientes nuevos</p>
                <p className="text-2xl font-bold">{summary.newClientsMonth}</p>
                <p className="text-xs text-gray-400 mt-1">{summary.newClientsWeek} esta semana</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-gray-500 mb-1">Pedidos entregados</p>
                <p className="text-2xl font-bold">{summary.ordersByStatus["ENTREGADO"] ?? 0}</p>
                <p className="text-xs text-gray-400 mt-1">Total histórico</p>
              </CardContent>
            </Card>
          </div>

          {/* Orders by status + Top products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Orders by status */}
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold mb-4">Pedidos por estado</p>
                <div className="space-y-2">
                  {Object.entries(STATUS_LABELS).map(([key, label]) => {
                    const count = summary.ordersByStatus[key] ?? 0
                    const total = Object.values(summary.ordersByStatus).reduce((a, b) => a + b, 0) || 1
                    const pct = Math.round((count / total) * 100)
                    return (
                      <div key={key} className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium w-24 text-center ${STATUS_COLORS[key]}`}>
                          {label}
                        </span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-gray-400"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 products */}
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold mb-4">Top 5 productos (este mes)</p>
                {summary.topProducts.length === 0 ? (
                  <p className="text-sm text-gray-400">Sin ventas este mes</p>
                ) : (
                  <div className="space-y-3">
                    {summary.topProducts.map((p, idx) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}</span>
                        <span className="text-sm flex-1 truncate">{p.name}</span>
                        <span className="text-sm font-semibold">{p.qty} uds.</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity feed */}
          <Card>
            <CardContent className="p-5">
              <p className="text-sm font-semibold mb-4">Actividad reciente</p>
              {summary.activity.length === 0 ? (
                <p className="text-sm text-gray-400">Sin actividad reciente</p>
              ) : (
                <div className="space-y-3">
                  {summary.activity.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${event.type === "order" ? "bg-blue-400" : "bg-green-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{event.label}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(event.createdAt).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-sm text-red-500">Error al cargar el dashboard.</p>
      )}
    </div>
  )
}
