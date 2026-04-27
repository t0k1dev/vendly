"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type Inventory = {
  id: string
  name: string
  status: string
  createdAt: string
  _count: { products: number }
}

export default function InventoriesPage() {
  const [inventories, setInventories] = useState<Inventory[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showEdit, setShowEdit] = useState<Inventory | null>(null)
  const [showDelete, setShowDelete] = useState<Inventory | null>(null)
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventories = async () => {
    const res = await fetch("/api/inventories")
    if (res.ok) setInventories(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchInventories() }, [])

  const handleCreate = async () => {
    if (!name.trim()) { setError("El nombre es requerido"); return }
    setSaving(true); setError(null)
    const res = await fetch("/api/inventories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setSaving(false)
    if (!res.ok) { setError("Error al crear el inventario"); return }
    setShowCreate(false); setName(""); fetchInventories()
  }

  const handleEdit = async () => {
    if (!showEdit || !name.trim()) { setError("El nombre es requerido"); return }
    setSaving(true); setError(null)
    const res = await fetch(`/api/inventories/${showEdit.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    setSaving(false)
    if (!res.ok) { setError("Error al actualizar"); return }
    setShowEdit(null); setName(""); fetchInventories()
  }

  const handleDelete = async () => {
    if (!showDelete) return
    setSaving(true)
    await fetch(`/api/inventories/${showDelete.id}`, { method: "DELETE" })
    setSaving(false); setShowDelete(null); fetchInventories()
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Inventarios</h1>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus colecciones de productos</p>
        </div>
        <Button onClick={() => { setName(""); setError(null); setShowCreate(true) }}>
          + Nuevo inventario
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : inventories.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Sin inventarios</p>
          <p className="text-sm mt-1">Crea tu primer inventario para empezar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inventories.map((inv) => (
            <Card key={inv.id}>
              <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-base font-semibold">
                  <Link href={`/dashboard/inventories/${inv.id}`} className="hover:underline">
                    {inv.name}
                  </Link>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{inv._count.products} productos</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setName(inv.name); setError(null); setShowEdit(inv) }}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDelete(inv)}
                  >
                    Archivar
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Create modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo inventario</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input placeholder="Ej: Ropa de temporada" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? "Creando..." : "Crear"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit modal */}
      <Dialog open={!!showEdit} onOpenChange={(o) => { if (!o) setShowEdit(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar inventario</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Nombre</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEdit(null)}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!showDelete} onOpenChange={(o) => { if (!o) setShowDelete(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>¿Archivar inventario?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            El inventario <strong>{showDelete?.name}</strong> será archivado. Los productos no se eliminarán.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(null)}>Cancelar</Button>
            <Button onClick={handleDelete} disabled={saving}>{saving ? "Archivando..." : "Archivar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
