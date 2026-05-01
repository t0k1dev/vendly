"use client"

import { useState } from "react"
import Link from "next/link"
import { Users } from "lucide-react"
import { toast } from "sonner"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
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

type Client = {
  id: string
  name: string | null
  phone: string
  location: string | null
  tags: string[]
  createdAt: string
  _count: { orders: number }
}

export default function ClientsPage() {
  const [search, setSearch] = useState("")
  const [tagFilter, setTagFilter] = useState("")
  const [showNew, setShowNew] = useState(false)

  const params = new URLSearchParams()
  if (search) params.set("search", search)
  if (tagFilter) params.set("tag", tagFilter)

  const { data: clients = [], isLoading: loading, error: loadError, mutate } = useSWR<Client[]>(
    `/api/clients?${params}`, fetcher, { keepPreviousData: true }
  )

  // Collect all unique tags from loaded clients
  const allTags = Array.from(new Set(clients.flatMap((c) => c.tags)))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
        <Button onClick={() => setShowNew(true)}>+ Nuevo cliente</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Input
          placeholder="Buscar por nombre o teléfono..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="rounded-lg border border-input bg-transparent px-3 py-2 text-sm"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        >
          <option value="">Todos los tags</option>
          {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loadError ? (
        <p className="text-sm text-destructive">Error al cargar los clientes.</p>
      ) : loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
        </div>
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Users className="size-10 opacity-30" />
          <p className="font-medium">Sin clientes</p>
          <p className="text-sm">Los clientes se agregan automáticamente desde WhatsApp</p>
          <button
            onClick={() => setShowNew(true)}
            className="mt-2 text-sm text-primary underline underline-offset-2"
          >
            Agregar cliente manualmente
          </button>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.name ?? <span className="text-muted-foreground italic">Sin nombre</span>}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c._count.orders}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {new Date(c.createdAt).toLocaleDateString("es-BO")}
                  </TableCell>
                  <TableCell>
                    <Link href={`/dashboard/clients/${c.id}`} className="text-xs text-blue-600 hover:underline">
                      Ver
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {showNew && (
        <NewClientModal
          onClose={() => setShowNew(false)}
          onCreated={() => { setShowNew(false); mutate(); toast.success("Cliente creado") }}
        />
      )}
    </div>
  )
}

// ─── New client modal ─────────────────────────────────────────────────────────

const PHONE_PREFIXES = [
  { code: "+591", label: "🇧🇴 +591" },
  { code: "+54",  label: "🇦🇷 +54" },
  { code: "+55",  label: "🇧🇷 +55" },
  { code: "+56",  label: "🇨🇱 +56" },
  { code: "+57",  label: "🇨🇴 +57" },
  { code: "+51",  label: "🇵🇪 +51" },
  { code: "+52",  label: "🇲🇽 +52" },
  { code: "+1",   label: "🇺🇸 +1" },
]

function NewClientModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [prefix, setPrefix] = useState("+591")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)

  const validateEmail = (val: string) => {
    if (!val) return null
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) ? null : "Email inválido"
  }

  const handleSubmit = async () => {
    if (!phoneNumber) { setError("Teléfono requerido"); return }
    const emailErr = validateEmail(email)
    if (emailErr) { setEmailError(emailErr); return }
    setSaving(true); setError(null)
    const phone = `${prefix}${phoneNumber.replace(/\s/g, "")}`
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        name: name || null,
        email: email || null,
        notes: notes || null,
      }),
    })
    setSaving(false)
    if (!res.ok) { const j = await res.json(); setError(j.error ?? "Error al crear cliente"); return }
    onCreated()
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="w-[95vw] sm:max-w-sm">
        <DialogHeader><DialogTitle>Nuevo cliente</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">

          {/* Phone */}
          <div className="space-y-1">
            <Label>Teléfono *</Label>
            <div className="flex gap-1.5">
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="rounded-lg border border-input bg-transparent px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring shrink-0"
              >
                {PHONE_PREFIXES.map((p) => (
                  <option key={p.code} value={p.code}>{p.label}</option>
                ))}
              </select>
              <Input
                placeholder="71234567"
                value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value); setError(null) }}
                type="tel"
                className="flex-1"
              />
            </div>
          </div>

          {/* Name */}
          <div className="space-y-1">
            <Label>Nombre <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input placeholder="Ej: María García" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label>Email <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <Input
              placeholder="Ej: maria@email.com"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(validateEmail(e.target.value)) }}
              className={emailError ? "border-destructive focus-visible:ring-destructive" : ""}
            />
            {emailError && <p className="text-xs text-destructive">{emailError}</p>}
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label>Notas <span className="text-muted-foreground text-xs">(opcional)</span></Label>
            <textarea
              className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={2}
              maxLength={500}
              placeholder="Ej: Prefiere entregas por la tarde"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? "Creando..." : "Crear"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
