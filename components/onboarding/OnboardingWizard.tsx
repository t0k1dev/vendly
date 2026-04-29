"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(1, "El nombre de la tienda es requerido"),
  category: z.string().optional(),
  country: z.string().optional(),
})

const step2Schema = z.object({
  productName: z.string().min(1, "El nombre del producto es requerido"),
  price: z.string().refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Precio inválido"),
  stock: z.string().refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Stock inválido"),
  currency: z.enum(["USD", "BOB"]),
})

const step3Schema = z.object({
  phoneNumberId: z.string().min(1, "Phone Number ID requerido"),
  token: z.string().min(1, "Token requerido"),
})

const step4Schema = z.object({
  salutation: z.string().min(1, "La salutación es requerida"),
})

type Step1Data = z.infer<typeof step1Schema>
type Step2Data = z.infer<typeof step2Schema>
type Step3Data = z.infer<typeof step3Schema>
type Step4Data = z.infer<typeof step4Schema>

const TOTAL_STEPS = 5

// ─── Step Indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => {
          const n = i + 1
          const isDone = n < step
          const isActive = n === step
          return (
            <div key={n} className="flex items-center gap-1.5 flex-1 last:flex-none">
              <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone
                    ? "bg-foreground text-background"
                    : isActive
                    ? "bg-foreground text-background"
                    : "border border-muted-foreground/30 text-muted-foreground/50"
                }`}
              >
                {isDone ? (
                  <svg className="size-3" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : n}
              </div>
              {n < TOTAL_STEPS && (
                <div className={`flex-1 h-px transition-colors ${n < step ? "bg-foreground" : "bg-muted-foreground/20"}`} />
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Paso {step} de {TOTAL_STEPS}</p>
    </div>
  )
}

// ─── Step 1: Store Info ───────────────────────────────────────────────────────

function Step1({
  storeId,
  defaultValues,
  onNext,
}: {
  storeId: string
  defaultValues: Partial<Step1Data>
  onNext: (data: Step1Data) => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues,
  })

  const onSubmit = async (data: Step1Data) => {
    setLoading(true)
    setError(null)
    const res = await fetch(`/api/store/${storeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (!res.ok) { setError("Error al guardar. Intenta de nuevo."); return }
    onNext(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nombre de tu tienda *</Label>
        <Input id="name" placeholder="Ej: Tienda La Esperanza" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="category">Categoría</Label>
        <Input id="category" placeholder="Ej: Ropa, Electrónica, Alimentos..." {...register("category")} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="country">País</Label>
        <Input id="country" placeholder="Ej: México, Colombia, Perú..." {...register("country")} />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Continuar"}
      </Button>
    </form>
  )
}

// ─── Step 2: First Product ────────────────────────────────────────────────────

function Step2({
  storeId,
  onNext,
  onSkip,
}: {
  storeId: string
  onNext: () => void
  onSkip: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { currency: "USD" },
  })

  const onSubmit = async (data: Step2Data) => {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeId,
        name: data.productName,
        price: Number(data.price),
        stock: Number(data.stock),
        currency: data.currency,
      }),
    })
    setLoading(false)
    if (!res.ok) { setError("Error al guardar el producto."); return }
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="productName">Nombre del producto *</Label>
        <Input id="productName" placeholder="Ej: Camiseta azul talla M" {...register("productName")} />
        {errors.productName && <p className="text-sm text-red-500">{errors.productName.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="price">Precio *</Label>
          <Input id="price" type="number" step="0.01" placeholder="0.00" {...register("price")} />
          {errors.price && <p className="text-sm text-red-500">{errors.price.message}</p>}
        </div>
        <div className="space-y-1">
          <Label htmlFor="stock">Stock *</Label>
          <Input id="stock" type="number" placeholder="0" {...register("stock")} />
          {errors.stock && <p className="text-sm text-red-500">{errors.stock.message}</p>}
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="currency">Moneda *</Label>
        <select
          id="currency"
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          {...register("currency")}
        >
          <option value="USD">USD — Dólar estadounidense</option>
          <option value="BOB">BOB — Boliviano</option>
        </select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Agregar producto"}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={onSkip}>
        Saltar por ahora
      </Button>
    </form>
  )
}

// ─── Step 3: WhatsApp ─────────────────────────────────────────────────────────

function Step3({
  storeId,
  onNext,
  onSkip,
}: {
  storeId: string
  onNext: () => void
  onSkip: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  })

  const onSubmit = async (data: Step3Data) => {
    setLoading(true)
    setError(null)
    const res = await fetch("/api/whatsapp/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId, ...data }),
    })
    const json = await res.json()
    setLoading(false)
    if (!res.ok) { setError(json.error ?? "Error al conectar WhatsApp."); return }
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-700">
        Necesitas una cuenta de Meta Business.{" "}
        <a
          href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-medium"
        >
          Ver guía de configuración
        </a>
      </div>
      <div className="space-y-1">
        <Label htmlFor="phoneNumberId">Phone Number ID</Label>
        <Input id="phoneNumberId" placeholder="Desde Meta Developer Console" {...register("phoneNumberId")} />
        {errors.phoneNumberId && <p className="text-sm text-red-500">{errors.phoneNumberId.message}</p>}
      </div>
      <div className="space-y-1">
        <Label htmlFor="token">Token de acceso permanente</Label>
        <Input id="token" type="password" placeholder="Token de sistema" {...register("token")} />
        {errors.token && <p className="text-sm text-red-500">{errors.token.message}</p>}
      </div>
      {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">{error}</div>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Verificando..." : "Conectar WhatsApp"}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={onSkip}>
        Saltar por ahora
      </Button>
    </form>
  )
}

// ─── Step 4: Agent Salutation ─────────────────────────────────────────────────

function Step4({
  storeId,
  onNext,
  onBack,
}: {
  storeId: string
  onNext: () => void
  onBack: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: { salutation: "¡Hola! Bienvenido a nuestra tienda, ¿en qué te puedo ayudar?" },
  })

  const onSubmit = async (data: Step4Data) => {
    setLoading(true)
    setError(null)
    // Upsert AgentConfig with salutation
    const res = await fetch(`/api/agent-config/${storeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ salutation: data.salutation }),
    })
    setLoading(false)
    if (!res.ok) { setError("Error al guardar la salutación."); return }
    onNext()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="salutation">Salutación del agente *</Label>
        <textarea
          id="salutation"
          rows={4}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          placeholder="¡Hola! ¿En qué te puedo ayudar?"
          {...register("salutation")}
        />
        {errors.salutation && <p className="text-sm text-red-500">{errors.salutation.message}</p>}
        <p className="text-xs text-gray-500">Este mensaje lo recibirán tus clientes al iniciar una conversación.</p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Guardando..." : "Continuar"}
      </Button>
      <Button type="button" variant="outline" className="w-full" onClick={onBack}>
        Atrás
      </Button>
    </form>
  )
}

// ─── Step 5: Go Live ──────────────────────────────────────────────────────────

function Step5({
  storeId,
  storeName,
  whatsappConnected,
}: {
  storeId: string
  storeName: string
  whatsappConnected: boolean
}) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleGoLive = async () => {
    setLoading(true)
    await fetch(`/api/store/${storeId}/complete-onboarding`, { method: "PATCH" })
    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600">✓</span>
          <span>Tienda configurada: <strong>{storeName}</strong></span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {whatsappConnected ? (
            <><span className="text-green-600">✓</span><span>WhatsApp conectado</span></>
          ) : (
            <><span className="text-muted-foreground">–</span><span className="text-muted-foreground">WhatsApp pendiente (puedes conectarlo desde configuración)</span></>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-green-600">✓</span>
          <span>Agente listo en español</span>
        </div>
      </div>
      <Button className="w-full" onClick={handleGoLive} disabled={loading}>
        {loading ? "Activando..." : "¡Ir al dashboard!"}
      </Button>
    </div>
  )
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

const STEP_TITLES = [
  { title: "Configura tu tienda", description: "Cuéntanos sobre tu negocio" },
  { title: "Agrega tu primer producto", description: "Así tu agente sabrá qué vender" },
  { title: "Conecta WhatsApp", description: "Tu canal de ventas principal" },
  { title: "Salutación del agente", description: "Cómo saludará a tus clientes" },
  { title: "¡Todo listo!", description: "Tu tienda está configurada" },
]

export default function OnboardingPage({
  storeId,
  initialStoreName,
}: {
  storeId: string
  initialStoreName: string
}) {
  const [step, setStep] = useState(1)
  const [storeName, setStoreName] = useState(initialStoreName)
  const [step1Data, setStep1Data] = useState<Partial<Step1Data>>({ name: initialStoreName })
  const [whatsappConnected, setWhatsappConnected] = useState(false)

  const { title, description } = STEP_TITLES[step - 1]

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md space-y-2">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-2xl font-bold tracking-tight">Vendly</span>
        </div>

        <div className="rounded-xl border bg-background p-6 shadow-sm">
          <StepIndicator step={step} />

          <div
            key={step}
            className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 [animation-fill-mode:both]"
          >
            <div className="mb-5">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
            </div>

            {step === 1 && (
              <Step1
                storeId={storeId}
                defaultValues={step1Data}
                onNext={(data) => { setStep1Data(data); setStoreName(data.name); setStep(2) }}
              />
            )}
            {step === 2 && (
              <Step2
                storeId={storeId}
                onNext={() => setStep(3)}
                onSkip={() => setStep(3)}
              />
            )}
            {step === 3 && (
              <Step3
                storeId={storeId}
                onNext={() => { setWhatsappConnected(true); setStep(4) }}
                onSkip={() => setStep(4)}
              />
            )}
            {step === 4 && (
              <Step4
                storeId={storeId}
                onNext={() => setStep(5)}
                onBack={() => setStep(3)}
              />
            )}
            {step === 5 && (
              <Step5
                storeId={storeId}
                storeName={storeName}
                whatsappConnected={whatsappConnected}
              />
            )}

            {step > 1 && step < 4 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Atrás
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
