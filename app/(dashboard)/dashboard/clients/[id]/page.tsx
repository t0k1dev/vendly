"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type Order = {
  id: string
  status: string
  total: string
  source: string
  createdAt: string
  items: Array<{ quantity: number; product: { name: string } }>
}

type ClientDetail = {
  id: string
  name: string | null
  phone: string
  location: string | null
  notes: string | null
  tags: string[]
  createdAt: string
  orders: Order[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDIENTE: "bg-yellow-100 text-yellow-800",
  CONFIRMADO: "bg-blue-100 text-blue-800",
  ENVIADO: "bg-purple-100 text-purple-800",
  ENTREGADO: "bg-green-100 text-green-800",
  CANCELADO: "bg-red-100 text-red-800",
}

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE: "Pendiente", CONFIRMADO: "Confirmado", ENVIADO: "Enviado",
  ENTREGADO: "Entregado", CANCELADO: "Cancelado",
}

export default function ClientProfilePage() {
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<ClientDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Edit form state
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [notes, setNotes] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const fetchClient = async () => {
    const res = await fetch(`/api/clients/${id}`)
    if (res.ok) {
      const data = await res.json()
      setClient(data)
      setName(data.name ?? "")
      setLocation(data.location ?? "")
      setNotes(data.notes ?? "")
      setTags(data.tags ?? [])
    }
    setLoading(false)
  }

  useEffect(() => { fetchClient() }, [id])

  const handleSave = async () => {
    setSaving(true); setError(null)
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name || null, location: location || null, notes: notes || null, tags }),
    })
    setSaving(false)
    if (!res.ok) { setError("Error al guardar"); return }
    const updated = await res.json()
    setClient((prev) => prev ? { ...prev, ...updated } : prev)
    setEditing(false)
    toast.success("Cliente actualizado")
  }

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput("")
  }

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  )
  if (!client) return <div className="p-8 text-sm text-red-500">Cliente no encontrado.</div>

  const totalSpent = client.orders
    .filter((o) => o.status !== "CANCELADO")
    .reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-sm text-gray-500 hover:underline">← Clientes</Link>
        <div className="flex items-start justify-between mt-2">
          <div>
            <h1 className="text-2xl font-bold">{client.name ?? client.phone}</h1>
            {client.name && <p className="text-sm text-gray-500">{client.phone}</p>}
          </div>
          {!editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Editar</Button>
          )}
        </div>
      </div>

      {/* Info card */}
      <Card className="mb-4">
        <CardContent className="p-5 space-y-4">
          {editing ? (
            <>
              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del cliente" />
              </div>
              <div className="space-y-1">
                <Label>Ubicación</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Cochabamba" />
              </div>
              <div className="space-y-1">
                <Label>Notas</Label>
                <textarea
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas internas..."
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1 mb-2">
                  {tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-xs">
                      {t}
                      <button onClick={() => removeTag(t)} className="text-gray-400 hover:text-red-500 leading-none">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag() } }}
                    placeholder="Ej: VIP, mayorista"
                    className="flex-1"
                  />
                  <Button size="sm" variant="outline" onClick={addTag}>Agregar</Button>
                </div>
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex gap-2 pt-1">
                <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
                <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Teléfono</p>
                  <p>{client.phone}</p>
                </div>
                {client.location && (
                  <div>
                    <p className="text-xs text-gray-400">Ubicación</p>
                    <p>{client.location}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-400">Cliente desde</p>
                  <p>{new Date(client.createdAt).toLocaleDateString("es-BO")}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Total gastado</p>
                  <p className="font-semibold">${totalSpent.toFixed(2)}</p>
                </div>
              </div>
              {client.notes && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Notas</p>
                  <p className="text-sm">{client.notes}</p>
                </div>
              )}
              {client.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {client.tags.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Order history */}
      <h2 className="text-base font-semibold mb-3">Historial de pedidos ({client.orders.length})</h2>
      {client.orders.length === 0 ? (
        <p className="text-sm text-gray-400">Sin pedidos aún.</p>
      ) : (
        <div className="space-y-2">
          {client.orders.map((o) => (
            <Link key={o.id} href={`/dashboard/orders/${o.id}`}>
              <Card className="hover:bg-gray-50 transition-colors cursor-pointer">
                <CardContent className="p-4 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {o.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ")}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString("es-BO")} ·{" "}
                      {o.source === "WHATSAPP" ? "WhatsApp" : "Manual"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                    <span className="text-sm font-semibold">${Number(o.total).toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
