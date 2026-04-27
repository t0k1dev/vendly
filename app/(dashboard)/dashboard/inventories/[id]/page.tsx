"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type Product = {
  id: string
  name: string
  sku: string | null
  price: string
  currency: string
  stock: number
  category: string | null
  imageUrl: string | null
  lowStockThreshold: number
}

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  sku: z.string().optional(),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Precio inválido"),
  currency: z.enum(["USD", "BOB"]),
  stock: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Stock inválido"),
  category: z.string().optional(),
  lowStockThreshold: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Umbral inválido"),
})

type ProductForm = z.infer<typeof productSchema>

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", BOB: "Bs." }

export default function InventoryDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showDelete, setShowDelete] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: { currency: "USD", lowStockThreshold: "5" },
  })

  const fetchProducts = async () => {
    const res = await fetch(`/api/inventories/${id}/products`)
    if (res.ok) setProducts(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchProducts() }, [id])

  const openCreate = () => {
    setEditing(null)
    reset({ currency: "USD", lowStockThreshold: "5" })
    setImageFile(null); setImagePreview(null); setApiError(null)
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    reset({
      name: p.name,
      sku: p.sku ?? "",
      price: String(p.price),
      currency: p.currency as "USD" | "BOB",
      stock: String(p.stock),
      category: p.category ?? "",
      lowStockThreshold: String(p.lowStockThreshold),
    })
    setImageFile(null); setImagePreview(p.imageUrl); setApiError(null)
    setShowForm(true)
  }

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) setImagePreview(URL.createObjectURL(file))
  }

  const onSubmit = async (data: ProductForm) => {
    setSaving(true); setApiError(null)

    let imageUrl: string | null = editing?.imageUrl ?? null

    // Upload image if a new one was selected
    if (imageFile) {
      const fd = new FormData()
      fd.append("file", imageFile)
      const uploadRes = await fetch("/api/products/upload-image", { method: "POST", body: fd })
      if (!uploadRes.ok) { setApiError("Error al subir la imagen"); setSaving(false); return }
      const { url } = await uploadRes.json()
      imageUrl = url
    }

    const payload = {
      name: data.name,
      sku: data.sku || null,
      price: Number(data.price),
      currency: data.currency,
      stock: Number(data.stock),
      category: data.category || null,
      lowStockThreshold: Number(data.lowStockThreshold),
      imageUrl,
      // Only needed for create
      ...(!editing && { storeId: undefined, inventoryId: id }),
    }

    let res: Response
    if (editing) {
      res = await fetch(`/api/products/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } else {
      res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, inventoryId: id }),
      })
    }

    setSaving(false)
    if (!res.ok) { setApiError("Error al guardar el producto"); return }
    setShowForm(false); fetchProducts()
  }

  const handleDelete = async () => {
    if (!showDelete) return
    setSaving(true)
    await fetch(`/api/products/${showDelete.id}`, { method: "DELETE" })
    setSaving(false); setShowDelete(null); fetchProducts()
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/dashboard/inventories" className="text-sm text-gray-500 hover:underline">
            ← Inventarios
          </Link>
          <h1 className="text-2xl font-bold mt-1">Productos</h1>
        </div>
        <Button onClick={openCreate}>+ Nuevo producto</Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Cargando...</p>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">Sin productos</p>
          <p className="text-sm mt-1">Agrega tu primer producto a este inventario</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((p) => {
            const isLowStock = p.stock < p.lowStockThreshold
            const symbol = CURRENCY_SYMBOL[p.currency] ?? p.currency
            return (
              <Card key={p.id}>
                <CardContent className="p-4 flex gap-3">
                  {p.imageUrl ? (
                    <div className="relative h-16 w-16 shrink-0 rounded-md overflow-hidden bg-gray-100">
                      <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="h-16 w-16 shrink-0 rounded-md bg-gray-100 flex items-center justify-center text-gray-300 text-xl">
                      ?
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm truncate">{p.name}</p>
                      {isLowStock && (
                        <Badge variant="destructive" className="shrink-0 text-xs">Stock bajo</Badge>
                      )}
                    </div>
                    {p.category && <p className="text-xs text-gray-400">{p.category}</p>}
                    <p className="text-sm font-medium mt-1">{symbol}{Number(p.price).toFixed(2)}</p>
                    <p className={`text-xs mt-0.5 ${isLowStock ? "text-red-500 font-medium" : "text-gray-500"}`}>
                      Stock: {p.stock}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => openEdit(p)}>Editar</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowDelete(p)}>Eliminar</Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create / Edit modal */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) setShowForm(false) }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 py-2">
            <div className="space-y-1">
              <Label>Nombre *</Label>
              <Input placeholder="Ej: Camiseta azul M" {...register("name")} />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>SKU</Label>
                <Input placeholder="Ej: CAM-AZL-M" {...register("sku")} />
              </div>
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Input placeholder="Ej: Ropa" {...register("category")} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label>Precio *</Label>
                <Input type="number" step="0.01" placeholder="0.00" {...register("price")} />
                {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Moneda</Label>
                <select
                  className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  {...register("currency")}
                >
                  <option value="USD">USD</option>
                  <option value="BOB">BOB</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label>Stock *</Label>
                <Input type="number" placeholder="0" {...register("stock")} />
                {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Umbral de stock bajo</Label>
              <Input type="number" placeholder="5" {...register("lowStockThreshold")} />
            </div>
            <div className="space-y-1">
              <Label>Imagen</Label>
              <Input type="file" accept="image/*" onChange={onImageChange} />
              {imagePreview && (
                <div className="relative h-24 w-24 mt-2 rounded-md overflow-hidden bg-gray-100">
                  <Image src={imagePreview} alt="preview" fill className="object-cover" />
                </div>
              )}
            </div>
            {apiError && <p className="text-sm text-red-500">{apiError}</p>}
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit" disabled={saving}>{saving ? "Guardando..." : editing ? "Guardar" : "Crear"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!showDelete} onOpenChange={(o) => { if (!o) setShowDelete(null) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>¿Eliminar producto?</DialogTitle></DialogHeader>
          <p className="text-sm text-gray-600 py-2">
            <strong>{showDelete?.name}</strong> será eliminado permanentemente.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(null)}>Cancelar</Button>
            <Button onClick={handleDelete} disabled={saving}>{saving ? "Eliminando..." : "Eliminar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
