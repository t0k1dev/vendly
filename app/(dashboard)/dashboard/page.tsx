"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

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

const PERIOD_LABELS = { today: "Hoy", week: "Esta semana", month: "Este mes" } as const
type Period = keyof typeof PERIOD_LABELS

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function PopNumber({ value }: { value: string }) {
  const chars = value.split("")
  return (
    <span className="t-digit-group is-animating">
      {chars.map((ch, i) => {
        const stagger =
          i === chars.length - 2 ? "1" : i === chars.length - 1 ? "2" : undefined
        return (
          <span key={i} className="t-digit" {...(stagger ? { "data-stagger": stagger } : {})}>
            {ch}
          </span>
        )
      })}
    </span>
  )
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>("month")
  const { data: summary, isLoading } = useSWR<Summary>(
    `/api/dashboard/summary?period=${period}`,
    fetcher,
    { keepPreviousData: true }
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      {/* Period selector */}
      <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              period === p ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {isLoading && !summary ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}><CardContent className="p-5"><Skeleton className="h-8 w-24 mb-2" /><Skeleton className="h-4 w-16" /></CardContent></Card>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card><CardContent className="p-5 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</CardContent></Card>
            <Card><CardContent className="p-5 space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full" />)}</CardContent></Card>
          </div>
        </div>
      ) : summary ? (
        <div className="space-y-6">
          {/* Top metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: `Ingresos (${PERIOD_LABELS[period]})`,
                value: `$${summary.revenue.toFixed(2)}`,
                sub: "Solo pedidos entregados",
              },
              {
                label: "Pedidos pendientes",
                value: String(summary.ordersByStatus["PENDIENTE"] ?? 0),
                sub: "Requieren atención",
              },
              {
                label: "Clientes nuevos",
                value: String(summary.newClientsMonth),
                sub: `${summary.newClientsWeek} esta semana`,
              },
              {
                label: "Pedidos entregados",
                value: String(summary.ordersByStatus["ENTREGADO"] ?? 0),
                sub: "Total histórico",
              },
            ].map((stat, i) => (
              <Card
                key={i}
                className="animate-in fade-in-0 slide-in-from-bottom-3 duration-500 [animation-fill-mode:both]"
                style={{ animationDelay: `${i * 75}ms` }}
              >
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">
                    <PopNumber key={`${period}-${stat.value}`} value={stat.value} />
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Orders by status + Top products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div className="t-progress h-2 rounded-full bg-muted-foreground/40" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm font-medium w-6 text-right">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm font-semibold mb-4">Top 5 productos (este mes)</p>
                {summary.topProducts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Sin ventas este mes</p>
                ) : (
                  <div className="space-y-3">
                    {summary.topProducts.map((p, idx) => (
                      <div key={p.id} className="flex items-center gap-3">
                        <span className="text-xs font-bold text-muted-foreground w-4">{idx + 1}</span>
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
                <p className="text-sm text-muted-foreground">Sin actividad reciente</p>
              ) : (
                <div className="space-y-3">
                  {summary.activity.map((event, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${event.type === "order" ? "bg-blue-400" : "bg-green-400"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">{event.label}</p>
                        <p className="text-xs text-muted-foreground">
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
        <p className="text-sm text-destructive">Error al cargar el dashboard.</p>
      )}
    </div>
  )
}
