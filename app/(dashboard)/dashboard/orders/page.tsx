"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { ShoppingCart, Search, SlidersHorizontal, X, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

type FilterKey = "status" | "source" | "from" | "to"
const FILTER_META: { key: FilterKey; label: string }[] = [
  { key: "status", label: "Estado" },
  { key: "source", label: "Origen" },
  { key: "from",   label: "Desde" },
  { key: "to",     label: "Hasta" },
]

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const [search, setSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<Partial<Record<FilterKey, string>>>({})
  const [pickerOpen, setPickerOpen] = useState(false)
  const [editingFilter, setEditingFilter] = useState<FilterKey | null>(null)
  const [draftValue, setDraftValue] = useState("")
  const pickerRef = useRef<HTMLDivElement>(null)
  const [showNewOrder, setShowNewOrder] = useState(false)

  // Close picker on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
        setEditingFilter(null)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const availableFilters = FILTER_META.filter((f) => !(f.key in activeFilters))

  const applyFilter = (key: FilterKey, value: string) => {
    if (!value) return
    setActiveFilters((prev) => ({ ...prev, [key]: value }))
    setPickerOpen(false)
    setEditingFilter(null)
  }

  const removeFilter = (key: FilterKey) => {
    setActiveFilters((prev) => { const n = { ...prev }; delete n[key]; return n })
  }

  const params = new URLSearchParams()
  if (search) params.set("clientSearch", search)
  if (activeFilters.status) params.set("status", activeFilters.status)
  if (activeFilters.source) params.set("source", activeFilters.source)
  if (activeFilters.from) params.set("from", activeFilters.from)
  if (activeFilters.to) params.set("to", activeFilters.to)

  const { data: orders = [], isLoading: loading, error: loadError, mutate } = useSWR<Order[]>(
    `/api/orders?${params}`, fetcher, { keepPreviousData: true }
  )

  const handleExport = () => {
    const ep = new URLSearchParams()
    if (activeFilters.status) ep.set("status", activeFilters.status)
    if (activeFilters.source) ep.set("source", activeFilters.source)
    window.location.href = `/api/orders/export?${ep}`
  }

  const filterChipLabel = (key: FilterKey, value: string) => {
    if (key === "status") return STATUS_LABELS[value] ?? value
    if (key === "source") return value === "WHATSAPP" ? "WhatsApp" : "Manual"
    return value
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

      {/* Search + Filters */}
      <div className="space-y-2 mb-6">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar por cliente..."
            className="pl-9 h-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {/* Active chips + add button */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.entries(activeFilters) as [FilterKey, string][]).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-3 py-1 text-xs font-medium"
            >
              <span className="text-muted-foreground">{FILTER_META.find(f => f.key === key)?.label}:</span>
              {filterChipLabel(key, value)}
              <button onClick={() => removeFilter(key)} className="text-muted-foreground hover:text-foreground ml-0.5">
                <X className="size-3" />
              </button>
            </span>
          ))}

          {/* Add filter button + picker */}
          {availableFilters.length > 0 && (
            <div className="relative" ref={pickerRef}>
              <button
                onClick={() => { setPickerOpen((p) => !p); setEditingFilter(null) }}
                className="inline-flex items-center gap-1.5 rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/50 transition-colors"
              >
                <SlidersHorizontal className="size-3" />
                Añadir filtro
                <ChevronDown className="size-3" />
              </button>

              {pickerOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 min-w-48 rounded-xl border bg-popover shadow-lg overflow-hidden">
                  {editingFilter === null ? (
                    // Filter list
                    availableFilters.map((f) => (
                      <button
                        key={f.key}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors"
                        onClick={() => { setEditingFilter(f.key); setDraftValue("") }}
                      >
                        {f.label}
                      </button>
                    ))
                  ) : (
                    // Value picker for selected filter
                    <div className="p-3 space-y-2 min-w-56">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {FILTER_META.find(f => f.key === editingFilter)?.label}
                      </p>
                      {editingFilter === "status" && (
                        <select
                          autoFocus
                          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={draftValue}
                          onChange={(e) => setDraftValue(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>{v}</option>
                          ))}
                        </select>
                      )}
                      {editingFilter === "source" && (
                        <select
                          autoFocus
                          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={draftValue}
                          onChange={(e) => setDraftValue(e.target.value)}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="WHATSAPP">WhatsApp</option>
                          <option value="MANUAL">Manual</option>
                        </select>
                      )}
                      {(editingFilter === "from" || editingFilter === "to") && (
                        <input
                          autoFocus
                          type="date"
                          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                          value={draftValue}
                          onChange={(e) => setDraftValue(e.target.value)}
                        />
                      )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditingFilter(null)}>
                          Atrás
                        </Button>
                        <Button size="sm" className="flex-1" disabled={!draftValue} onClick={() => applyFilter(editingFilter, draftValue)}>
                          Aplicar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Clear all */}
          {Object.keys(activeFilters).length > 0 && (
            <button
              onClick={() => setActiveFilters({})}
              className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              Limpiar todo
            </button>
          )}
        </div>
      </div>

      {/* Orders table */}
      {loadError ? (
        <p className="text-sm text-destructive">Error al cargar los pedidos.</p>
      ) : loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <ShoppingCart className="size-10 opacity-30" />
          <p className="font-medium">Sin pedidos</p>
          <p className="text-sm">Los pedidos de WhatsApp y manuales aparecerán aquí</p>
          <button
            onClick={() => setShowNewOrder(true)}
            className="mt-2 text-sm text-primary underline underline-offset-2"
          >
            Crear primer pedido
          </button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Productos</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Origen</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>
                    <p className="font-medium">{o.client.name ?? o.client.phone}</p>
                    {o.client.name && <p className="text-xs text-muted-foreground">{o.client.phone}</p>}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-xs truncate">
                    {o.items.map((i) => `${i.product.name} x${i.quantity}`).join(", ")}
                  </TableCell>
                  <TableCell className="font-medium">${Number(o.total).toFixed(2)}</TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                      {STATUS_LABELS[o.status]}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={o.source === "WHATSAPP" ? "default" : "outline"} className="text-xs">
                      {o.source === "WHATSAPP" ? "WhatsApp" : "Manual"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(o.createdAt).toLocaleDateString("es-BO")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/orders/${o.id}`} className="text-xs text-blue-600 hover:underline">
                      Ver
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* New Order Modal */}
      {showNewOrder && (
        <NewOrderModal
          onClose={() => setShowNewOrder(false)}
          onCreated={() => { setShowNewOrder(false); mutate(); toast.success("Pedido creado") }}
        />
      )}
    </div>
  )
}

// ─── Nueva Orden Modal ────────────────────────────────────────────────────────

type CartItem = { product: Product; quantity: number }

function NewOrderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const { data: clients = [] } = useSWR<Client[]>("/api/clients", fetcher)
  const { data: products = [] } = useSWR<Product[]>("/api/products", fetcher)

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
  const [localClients, setLocalClients] = useState<Client[]>([])

  const allClients = [...localClients, ...clients.filter((c) => !localClients.find((lc) => lc.id === c.id))]

  const filteredClients = allClients.filter((c) =>
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
    setLocalClients((prev) => [client, ...prev])
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
