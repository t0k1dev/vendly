"use client"

import { useState } from "react"
import Image from "next/image"
import { Package, Plus, Check } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import useSWR from "swr"
import { fetcher } from "@/lib/fetcher"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/ui/image-upload"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

type Product = {
  id: string
  name: string
  price: string
  currency: string
  stock: number
  category: string | null
  imageUrl: string | null
  imageUrls: string[]
  lowStockThreshold: number
}

const productSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(300, "Máximo 300 caracteres"),
  price: z.string()
    .min(1, "El precio es requerido")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "El precio debe ser mayor a 0"),
  currency: z.enum(["USD", "BOB"]),
  stock: z.string()
    .min(1, "El stock es requerido")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "El stock no puede ser negativo")
    .refine((v) => Number.isInteger(Number(v)), "El stock debe ser un número entero"),
  category: z.string().optional(),
  lowStockThreshold: z.string()
    .min(1, "Requerido")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Debe ser 0 o mayor")
    .refine((v) => Number.isInteger(Number(v)), "Debe ser un número entero"),
})

type ProductForm = z.infer<typeof productSchema>

const CURRENCY_SYMBOL: Record<string, string> = { USD: "$", BOB: "Bs." }

const STEPS = [
  { n: 1, label: "Información" },
  { n: 2, label: "Categoría" },
  { n: 3, label: "Imágenes" },
] as const

export default function ProductsPage() {
  const { data: products = [], isLoading: loading, error: loadError, mutate } = useSWR<Product[]>(
    "/api/products", fetcher, { keepPreviousData: true }
  )
  const { data: remoteCategories = [], mutate: mutateCategories } = useSWR<string[]>(
    "/api/categories", fetcher
  )

  const [showForm, setShowForm] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [editing, setEditing] = useState<Product | null>(null)
  const [showDelete, setShowDelete] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [imageUploading, setImageUploading] = useState(false)  // category state managed outside react-hook-form for step 2
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [newCategoryInput, setNewCategoryInput] = useState("")
  // local extra categories added this session (not yet in remoteCategories)
  const [localCategories, setLocalCategories] = useState<string[]>([])

  const allCategories = [
    ...remoteCategories,
    ...localCategories.filter((c) => !remoteCategories.includes(c)),
  ]

  const { register, handleSubmit, reset, watch, trigger, formState: { errors } } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    mode: "onTouched",
    defaultValues: { currency: "BOB", lowStockThreshold: "5", name: "", price: "", stock: "", category: "" },
  })

  const openCreate = () => {
    setEditing(null)
    setStep(1)
    setSelectedCategory("")
    setNewCategoryInput("")
    setLocalCategories([])
    reset({ currency: "BOB", lowStockThreshold: "5", name: "", price: "", stock: "", category: "" })
    setImageUrls([])
    setApiError(null)
    setShowForm(true)
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setStep(1)
    setSelectedCategory(p.category ?? "")
    setNewCategoryInput("")
    setLocalCategories(p.category && !remoteCategories.includes(p.category) ? [p.category] : [])
    reset({
      name: p.name,
      price: String(p.price),
      currency: p.currency as "USD" | "BOB",
      stock: String(p.stock),
      category: p.category ?? "",
      lowStockThreshold: String(p.lowStockThreshold),
    })
    setImageUrls(p.imageUrls?.length ? p.imageUrls : p.imageUrl ? [p.imageUrl] : [])
    setApiError(null)
    setShowForm(true)
  }

  const addNewCategory = () => {
    const trimmed = newCategoryInput.trim()
    if (!trimmed) return
    if (!allCategories.includes(trimmed)) {
      setLocalCategories((prev) => [...prev, trimmed])
    }
    setSelectedCategory(trimmed)
    setNewCategoryInput("")
  }

  const goToStep2 = async () => {
    const valid = await trigger(["name", "price", "stock", "lowStockThreshold"])
    if (valid) setStep(2)
  }

  const onSubmit = async (data: ProductForm) => {
    setSaving(true); setApiError(null)

    const payload = {
      name: data.name,
      price: Number(data.price),
      currency: data.currency,
      stock: Number(data.stock),
      category: selectedCategory || null,
      lowStockThreshold: Number(data.lowStockThreshold),
      imageUrls,
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
        body: JSON.stringify(payload),
      })
    }

    setSaving(false)
    if (!res.ok) { setApiError("Error al guardar el producto"); return }
    setShowForm(false)
    mutate()
    mutateCategories()
    toast.success(editing ? "Producto actualizado" : "Producto creado")
  }

  const handleDelete = async () => {
    if (!showDelete) return
    setSaving(true)
    await fetch(`/api/products/${showDelete.id}`, { method: "DELETE" })
    setSaving(false); setShowDelete(null)
    mutate()
    toast.success("Producto eliminado")
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Button onClick={openCreate}>+ Nuevo producto</Button>
      </div>

      {loadError ? (
        <p className="text-sm text-destructive">Error al cargar los productos.</p>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}><CardContent className="p-4 flex gap-3">
              <Skeleton className="h-16 w-16 rounded-md shrink-0" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-4 w-1/4" /></div>
            </CardContent></Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
          <Package className="size-10 opacity-30" />
          <p className="font-medium">Sin productos</p>
          <p className="text-sm">Agrega tu primer producto para que el agente pueda venderlo</p>
          <button
            onClick={openCreate}
            className="mt-2 text-sm text-primary underline underline-offset-2"
          >
            Agregar producto
          </button>
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
        <DialogContent className="w-[95vw] sm:max-w-md flex flex-col max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-1 px-1 pb-2">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center gap-1 flex-1">
                <button
                  type="button"
                  onClick={async () => {
                    if (s.n > step) {
                      if (s.n >= 2) {
                        const valid = await trigger(["name", "price", "stock", "lowStockThreshold"])
                        if (!valid) return
                      }
                    }
                    setStep(s.n as 1 | 2 | 3)
                  }}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap ${step === s.n ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-colors shrink-0 ${step === s.n ? "bg-foreground text-background" : step > s.n ? "bg-foreground/20 text-foreground" : "bg-muted text-muted-foreground"}`}>
                    {step > s.n ? <Check className="size-2.5" /> : s.n}
                  </span>
                  {s.label}
                </button>
                {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border mx-1" />}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-1">

              {/* ── Step 1: Info ── */}
              {step === 1 && (
                <div className="space-y-3 pb-2">
                  <div className="space-y-1">
                    <Label>Nombre *</Label>
                    <Input
                      placeholder="Ej: Camiseta azul M"
                      maxLength={300}
                      {...register("name")}
                      className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    <div className="flex justify-between items-center min-h-[16px]">
                      {errors.name
                        ? <p className="text-xs text-destructive">{errors.name.message}</p>
                        : <span />
                      }
                      <p className={`text-xs ml-auto ${(watch("name")?.length ?? 0) >= 280 ? "text-destructive" : "text-muted-foreground"}`}>
                        {watch("name")?.length ?? 0}/300
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label>Precio *</Label>
                      <Input type="number" step="0.01" placeholder="0.00" {...register("price")} className={errors.price ? "border-destructive focus-visible:ring-destructive" : ""} />
                      {errors.price && <p className="text-xs text-destructive">{errors.price.message}</p>}
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
                      <Input type="number" placeholder="0" {...register("stock")} className={errors.stock ? "border-destructive focus-visible:ring-destructive" : ""} />
                      {errors.stock && <p className="text-xs text-destructive">{errors.stock.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Umbral de stock bajo</Label>
                      <Input type="number" placeholder="5" {...register("lowStockThreshold")} />
                      {errors.lowStockThreshold && <p className="text-xs text-destructive">{errors.lowStockThreshold.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: Category ── */}
              {step === 2 && (
                <div className="space-y-3 pb-2">
                  <p className="text-sm text-muted-foreground">Selecciona una categoría o crea una nueva.</p>

                  {/* Chip list */}
                  <div className="flex flex-wrap gap-2">
                    {/* No category option */}
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("")}
                      className={`rounded-full border px-3 py-1 text-sm transition-colors ${selectedCategory === "" ? "border-foreground bg-foreground text-background" : "border-input hover:border-foreground/50"}`}
                    >
                      Sin categoría
                    </button>
                    {allCategories.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`rounded-full border px-3 py-1 text-sm transition-colors ${selectedCategory === cat ? "border-foreground bg-foreground text-background" : "border-input hover:border-foreground/50"}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* New category input */}
                  <div className="space-y-1">
                    <Label>Nueva categoría</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ej: Electrónica"
                        value={newCategoryInput}
                        onChange={(e) => setNewCategoryInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addNewCategory() } }}
                      />
                      <Button type="button" variant="outline" size="icon" onClick={addNewCategory} disabled={!newCategoryInput.trim()}>
                        <Plus className="size-4" />
                      </Button>
                    </div>
                  </div>

                  {selectedCategory && (
                    <p className="text-xs text-muted-foreground">
                      Seleccionada: <span className="font-medium text-foreground">{selectedCategory}</span>
                    </p>
                  )}
                </div>
              )}

              {/* ── Step 3: Images ── */}
              {step === 3 && (
                <div className="space-y-1 pb-2">
                  <Label>Imágenes <span className="text-muted-foreground font-normal">(opcional)</span></Label>
                  <ImageUpload
                    urls={imageUrls}
                    onChange={setImageUrls}
                    uploadUrl="/api/products/upload-image"
                    max={5}
                    onUploadingChange={setImageUploading}
                  />
                  {apiError && <p className="text-sm text-destructive pt-1">{apiError}</p>}
                </div>
              )}

            </div>{/* end scrollable */}

            <DialogFooter className="pt-4 pb-6 border-t">
              {step === 1 && (
                <>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
                  <Button type="button" onClick={goToStep2}>Siguiente</Button>
                </>
              )}
              {step === 2 && (
                <>
                  <Button type="button" variant="outline" onClick={() => setStep(1)}>Atrás</Button>
                  <Button type="button" onClick={() => setStep(3)}>Siguiente</Button>
                </>
              )}
              {step === 3 && (
                <>
                  <Button type="button" variant="outline" onClick={() => setStep(2)}>Atrás</Button>
                  <Button type="submit" disabled={saving || imageUploading}>
                    {imageUploading ? "Subiendo imágenes..." : saving ? "Guardando..." : editing ? "Guardar" : "Crear"}
                  </Button>
                </>
              )}
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
