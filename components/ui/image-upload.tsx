"use client"

import { useCallback, useRef, useState } from "react"
import Image from "next/image"
import { ImagePlus, Loader2, X, AlertCircle } from "lucide-react"

const ACCEPTED_TYPES = ["image/jpeg", "image/png"]
const ACCEPTED_EXT = "JPG, PNG"

interface ImageItem {
  id: string
  preview: string   // object URL (uploading) or remote URL (done)
  status: "uploading" | "done" | "error"
  error?: string
}

interface ImageUploadProps {
  /** Current committed image URLs (controlled) */
  urls: string[]
  /** Called whenever the committed URL list changes */
  onChange: (urls: string[]) => void
  /** API route that receives FormData { file } and returns { url: string } */
  uploadUrl: string
  /** Max number of images allowed (default 5) */
  max?: number
  /** Max size per file in MB (default 2) */
  maxSizeMB?: number
}

export function ImageUpload({
  urls,
  onChange,
  uploadUrl,
  max = 5,
  maxSizeMB = 2,
}: ImageUploadProps) {
  // Items being shown in the UI (uploading + done from external urls)
  const [items, setItems] = useState<ImageItem[]>(() =>
    urls.map((url) => ({ id: url, preview: url, status: "done" as const }))
  )
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const totalCount = items.filter((i) => i.status !== "error").length
  const canAdd = totalCount < max

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files)
      const slots = max - totalCount
      const toProcess = arr.slice(0, slots)

      for (const file of toProcess) {
        // Validate type
        if (!ACCEPTED_TYPES.includes(file.type)) {
          const errItem: ImageItem = {
            id: `err-${Date.now()}-${file.name}`,
            preview: "",
            status: "error",
            error: `"${file.name}" no es un formato válido. Solo ${ACCEPTED_EXT}.`,
          }
          setItems((prev) => [...prev, errItem])
          continue
        }

        // Validate size
        if (file.size > maxSizeMB * 1024 * 1024) {
          const errItem: ImageItem = {
            id: `err-${Date.now()}-${file.name}`,
            preview: "",
            status: "error",
            error: `"${file.name}" supera ${maxSizeMB} MB.`,
          }
          setItems((prev) => [...prev, errItem])
          continue
        }

        const preview = URL.createObjectURL(file)
        const id = `uploading-${Date.now()}-${file.name}`
        const loadingItem: ImageItem = { id, preview, status: "uploading" }
        setItems((prev) => [...prev, loadingItem])

        try {
          const fd = new FormData()
          fd.append("file", file)
          const res = await fetch(uploadUrl, { method: "POST", body: fd })
          if (!res.ok) throw new Error("Error al subir")
          const { url } = await res.json()

          setItems((prev) =>
            prev.map((item) =>
              item.id === id ? { id: url, preview: url, status: "done" } : item
            )
          )
          onChange([
            ...urls,
            url,
          ])
        } catch {
          setItems((prev) =>
            prev.map((item) =>
              item.id === id
                ? { ...item, status: "error", error: `No se pudo subir "${file.name}".` }
                : item
            )
          )
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [max, maxSizeMB, totalCount, uploadUrl, urls]
  )

  const removeItem = (item: ImageItem) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    if (item.status === "done") {
      onChange(urls.filter((u) => u !== item.preview))
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files) processFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-2">
      {/* Drop zone — only show if user can still add */}
      {canAdd && (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors
            ${dragging
              ? "border-primary bg-primary/5"
              : "border-input hover:border-primary/50 hover:bg-muted/40"
            }`}
        >
          <ImagePlus className="size-6 text-muted-foreground" />
          <p className="text-sm font-medium text-muted-foreground">
            Arrastra imágenes o <span className="text-primary underline underline-offset-2">selecciona archivos</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {ACCEPTED_EXT} · máx. {maxSizeMB} MB por imagen · hasta {max} {max === 1 ? "imagen" : "imágenes"}
          </p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            multiple={max > 1}
            className="sr-only"
            onChange={(e) => { if (e.target.files) processFiles(e.target.files); e.target.value = "" }}
          />
        </div>
      )}

      {/* Thumbnails grid */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative">
              {item.status === "error" ? (
                <div className="flex items-start gap-1.5 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive max-w-xs">
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
                  <span>{item.error}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="ml-auto shrink-0 cursor-pointer"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                  {item.preview && (
                    <Image src={item.preview} alt="preview" fill className="object-cover" unoptimized={item.status === "uploading"} />
                  )}
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="size-5 animate-spin text-white" />
                    </div>
                  )}
                  {item.status === "done" && (
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      className="absolute right-1 top-1 flex size-5 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-opacity hover:bg-black/80"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
