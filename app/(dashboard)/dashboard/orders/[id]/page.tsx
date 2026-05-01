"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type OrderDetail = {
  id: string
  status: string
  source: string
  total: string
  notes: string | null
  createdAt: string
  client: { id: string; name: string | null; phone: string; location: string | null }
  items: Array<{
    id: string
    quantity: number
    unitPrice: string
    product: { id: string; name: string; currency: string }
  }>
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
}

const STATUS_FLOW = ["PENDIENTE", "CONFIRMADO", "ENVIADO", "ENTREGADO"]

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
}

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", BOB: "Bs." }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: order, isLoading: loading, mutate } = useSWR<OrderDetail>(
    `/api/orders/${id}`, fetcher
  )

  const [saving, setSaving] = useState(false)
  const [showCancel, setShowCancel] = useState(false)

  const updateStatus = async (status: string) => {
    if (!order) return
    setSaving(true)
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    setSaving(false)
    if (res.ok) {
      mutate()
      toast.success(status === "CANCELADO" ? "Pedido cancelado" : `Estado actualizado a ${STATUS_LABELS[status]}`)
    } else {
      toast.error("Error al actualizar el estado")
    }
    setShowCancel(false)
  }

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  )
  if (!order) return <div className="p-8 text-sm text-red-500">Pedido no encontrado.</div>

  const isCancelled = order.status === "CANCELADO"
  const currentIdx = STATUS_FLOW.indexOf(order.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/orders" className="text-sm text-gray-500 hover:underline">
          ← Pedidos
        </Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold">Pedido</h1>
            <p className="text-xs text-gray-400 mt-0.5 font-mono">{order.id}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={order.source === "WHATSAPP" ? "default" : "outline"}>
              {order.source === "WHATSAPP" ? "WhatsApp" : "Manual"}
            </Badge>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
              {STATUS_LABELS[order.status]}
            </span>
          </div>
        </div>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="flex items-center gap-1 mb-6">
          {STATUS_FLOW.map((s, idx) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className={`h-2 flex-1 rounded-full ${idx <= currentIdx ? "bg-blue-500" : "bg-gray-200"}`} />
              {idx === STATUS_FLOW.length - 1 && (
                <span className="text-xs text-gray-400 whitespace-nowrap">{STATUS_LABELS[s]}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Client */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-gray-400 mb-1">Cliente</p>
          <p className="font-semibold">{order.client.name ?? order.client.phone}</p>
          {order.client.name && <p className="text-sm text-gray-500">{order.client.phone}</p>}
          {order.client.location && <p className="text-sm text-gray-500">{order.client.location}</p>}
        </CardContent>
      </Card>

      {/* Items */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-gray-400 mb-2">Productos</p>
          <div className="divide-y">
            {order.items.map((item) => {
              const symbol = CURRENCY_SYMBOL[item.product.currency] ?? "$"
              return (
                <div key={item.id} className="flex justify-between py-2 text-sm">
                  <span>{item.product.name} <span className="text-gray-400">×{item.quantity}</span></span>
                  <span className="font-medium">{symbol}{(Number(item.unitPrice) * item.quantity).toFixed(2)}</span>
                </div>
              )
            })}
            <div className="flex justify-between py-2 font-semibold text-sm">
              <span>Total</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <p className="text-xs text-gray-400 mb-1">Notas</p>
            <p className="text-sm">{order.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Meta */}
      <p className="text-xs text-gray-400 mb-6">
        Creado el {new Date(order.createdAt).toLocaleString("es-BO")}
      </p>

      {/* Actions */}
      {!isCancelled && (
        <div className="flex flex-wrap gap-2">
          {currentIdx < STATUS_FLOW.length - 1 && (
            <Button onClick={() => updateStatus(STATUS_FLOW[currentIdx + 1])} disabled={saving}>
              Marcar como {STATUS_LABELS[STATUS_FLOW[currentIdx + 1]]}
            </Button>
          )}
          <Button variant="outline" className="text-red-600 border-red-200" onClick={() => setShowCancel(true)}>
            Cancelar pedido
          </Button>
        </div>
      )}

      {/* Cancel confirmation */}
      <Dialog open={showCancel} onOpenChange={(o) => { if (!o) setShowCancel(false) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>¿Cancelar pedido?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">Esta acción no se puede deshacer.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancel(false)}>Volver</Button>
            <Button onClick={() => updateStatus("CANCELADO")} disabled={saving}>
              {saving ? "Cancelando..." : "Sí, cancelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
