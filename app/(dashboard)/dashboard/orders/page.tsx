"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

// ─── Types ────────────────────────────────────────────────────────────────────

type Client = { id: string; name: string | null; phone: string }
type Product = { id: string; name: string; price: string; currency: string; stock: number }
type OrderItem = { product: { id: string; name: string }; quantity: number; unitPrice: string }
type Order = {
  id: string
  status: string
  source: string
  total: string
  createdAt: string
  client: Client
  items: OrderItem[]
}

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

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", BOB: "Bs." }

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("")
  const [filterSource, setFilterSource] = useState("")
  const [filterClient, setFilterClient] = useState("")
  const [filterFrom, setFilterFrom] = useState("")
  const [filterTo, setFilterTo] = useState("")
  const [showNewOrder, setShowNewOrder] = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (filterStatus) params.set("status", filterStatus)
    if (filterSource) params.set("source", filterSource)
    if (filterClient) params.set("clientSearch", filterClient)
    if (filterFrom) params.set("from", filterFrom)
    if (filterTo) params.set("to", filterTo)
    const res = await fetch(`/api/orders?${params}`)
    if (res.ok) setOrders(await res.json())
    setLoading(false)
  }, [filterStatus, filterSource, filterClient, filterFrom, filterTo])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleExport = () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set("status", filterStatus)
    if (filterSource) params.set("source", filterSource)
    window.location.href = `/api/orders/export?${params}`
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>Exportar CSV</Button>
          <Button onClick={() => setShowNewOrder(true)}>+ Nuevo pedido</Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos los estados</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          value={filterSource}
          onChange={(e) => setFilterSource(e.target.value)}
        >
          <option value="">Todos los orígenes</option>
          <option value="WHATSAPP">WhatsApp</option>
          <option value="MANUAL">Manual</option>
        </select>
        <Input
          placeholder="Buscar cliente..."
          className="w-40"
          value={filterClient}
          onChange={(e) => setFilterClient(e.target.value)}
        />
        <Input type="date" className="w-36" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} />
        <Input type="date" className="w-36" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
      </div>

      {/* Orders table */}
      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Sin pedidos</p>
          <p className="text-sm mt-1">Los pedidos de WhatsApp y manuales aparecerán aquí</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Cliente</th>
                <th className="text-left px-4 py-3 font-medium">Productos</th>
                <th className="text-left px-4 py-3 font-medium">Total</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
                <th className="text-left px-4 py-3 font-medium">Origen</th>
                <th className="text-left px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium">{o.client.name ?? o.client.phone}</p>
                    {o.client.name && <p className="text-xs text-gray-400">{o.client.phone}</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                    {o.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 font-medium">${Number(o.total).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={o.source === "WHATSAPP" ? "default" : "outline"} className="text-xs">
                      {o.source === "WHATSAPP" ? "WhatsApp" : "Manual"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {new Date(o.createdAt).toLocaleDateString("es-BO")}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/orders/${o.id}`} className="text-xs text-blue-600 hover:underline">
                      Ver
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrder && (
        <NewOrderModal
          onClose={() => setShowNewOrder(false)}
          onCreated={() => { setShowNewOrder(false); fetchOrders() }}
        />
      )}
    </div>
  )
}

// ─── Nueva Orden Modal ────────────────────────────────────────────────────────

type CartItem = { product: Product; quantity: number }

function NewOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [clients, setClients] = useState<Client[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [clientSearch, setClientSearch] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [productSearch, setProductSearch] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  // Inline client creation
  const [newClientPhone, setNewClientPhone] = useState("")
  const [newClientName, setNewClientName] = useState("")
  const [creatingClient, setCreatingClient] = useState(false)

  useEffect(() => {
    fetch("/api/clients").then((r) => r.json()).then((d) => setClients(Array.isArray(d) ? d : []))
    fetch("/api/products").then((r) => r.json()).then((d) => setProducts(Array.isArray(d) ? d : []))
  }, [])

  const filteredClients = clients.filter((c) =>
    (c.name ?? "").toLowerCase().includes(clientSearch.toLowerCase()) ||
    c.phone.includes(clientSearch)
  )

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  )

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.product.id === product.id)
      if (existing) return prev.map((i) => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) setCart((prev) => prev.filter((i) => i.product.id !== productId))
    else setCart((prev) => prev.map((i) => i.product.id === productId ? { ...i, quantity: qty } : i))
  }

  const total = cart.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0)

  const handleCreateClient = async () => {
    if (!newClientPhone) return
    setCreatingClient(true)
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: newClientPhone, name: newClientName || null }),
    })
    setCreatingClient(false)
    if (!res.ok) { setError("Error al crear cliente"); return }
    const client = await res.json()
    setClients((prev) => [client, ...prev])
    setSelectedClient(client)
    setNewClientPhone(""); setNewClientName("")
  }

  const handleSubmit = async () => {
    if (!selectedClient) { setError("Selecciona un cliente"); return }
    if (cart.length === 0) { setError("Agrega al menos un producto"); return }
    setSaving(true); setError(null)
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientId: selectedClient.id,
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        notes: notes || undefined,
        source: "MANUAL",
      }),
    })
    setSaving(false)
    if (!res.ok) { const j = await res.json(); setError(j.error ?? "Error al crear pedido"); return }
    onCreated()
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo pedido</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Client selector */}
          <div className="space-y-2">
            <Label>Cliente</Label>
            {selectedClient ? (
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm font-medium">{selectedClient.name ?? selectedClient.phone}</span>
                <button className="text-xs text-gray-400 hover:text-gray-600" onClick={() => setSelectedClient(null)}>
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder="Buscar por nombre o teléfono..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                />
                {clientSearch && (
                  <div className="border rounded-lg divide-y max-h-32 overflow-y-auto">
                    {filteredClients.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                    ) : filteredClients.map((c) => (
                      <button
                        key={c.id}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                        onClick={() => { setSelectedClient(c); setClientSearch("") }}
                      >
                        {c.name ?? c.phone} {c.name && <span className="text-gray-400 text-xs">· {c.phone}</span>}
                      </button>
                    ))}
                  </div>
                )}
                {/* Inline create */}
                <div className="flex gap-2 pt-1">
                  <Input
                    placeholder="Teléfono nuevo cliente"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                  />
                  <Input
                    placeholder="Nombre (opcional)"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                  />
                  <Button size="sm" variant="outline" onClick={handleCreateClient} disabled={creatingClient || !newClientPhone}>
                    + Crear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Product selector */}
          <div className="space-y-2">
            <Label>Productos</Label>
            <Input
              placeholder="Buscar producto..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            {productSearch && (
              <div className="border rounded-lg divide-y max-h-40 overflow-y-auto">
                {filteredProducts.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-gray-400">Sin resultados</p>
                ) : filteredProducts.map((p) => (
                  <button
                    key={p.id}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex justify-between"
                    onClick={() => { addToCart(p); setProductSearch("") }}
                  >
                    <span>{p.name}</span>
                    <span className="text-gray-400">{CURRENCY_SYMBOL[p.currency]}{Number(p.price).toFixed(2)} · Stock: {p.stock}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Cart */}
            {cart.length > 0 && (
              <div className="border rounded-lg divide-y mt-2">
                {cart.map((i) => (
                  <div key={i.product.id} className="flex items-center justify-between px-3 py-2">
                    <span className="text-sm">{i.product.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {CURRENCY_SYMBOL[i.product.currency]}{(Number(i.product.price) * i.quantity).toFixed(2)}
                      </span>
                      <input
                        type="number"
                        min={1}
                        max={i.product.stock}
                        value={i.quantity}
                        onChange={(e) => updateQty(i.product.id, Number(e.target.value))}
                        className="w-14 border rounded px-2 py-0.5 text-sm text-center"
                      />
                      <button className="text-red-400 hover:text-red-600 text-xs" onClick={() => updateQty(i.product.id, 0)}>✕</button>
                    </div>
                  </div>
                ))}
                <div className="px-3 py-2 flex justify-between font-semibold text-sm bg-gray-50">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notas (opcional)</Label>
            <textarea
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Entregar por la tarde"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>
            {saving ? "Creando..." : `Crear pedido · $${total.toFixed(2)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
