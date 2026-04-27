"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type DaySchedule = { open: string; close: string; enabled: boolean }
type BusinessHours = Record<string, DaySchedule>

const DAYS = [
  { key: "mon", label: "Lunes" },
  { key: "tue", label: "Martes" },
  { key: "wed", label: "Miércoles" },
  { key: "thu", label: "Jueves" },
  { key: "fri", label: "Viernes" },
  { key: "sat", label: "Sábado" },
  { key: "sun", label: "Domingo" },
]

const DEFAULT_HOURS: BusinessHours = Object.fromEntries(
  DAYS.map(({ key }) => [key, { open: "09:00", close: "18:00", enabled: key !== "sun" }])
)

type AgentConfig = {
  salutation: string
  farewell: string
  tone: "FORMAL" | "INFORMAL"
  outOfHoursMsg: string
  businessHours: BusinessHours | null
}

const DEFAULT_CONFIG: AgentConfig = {
  salutation: "¡Hola! Bienvenido, ¿en qué te puedo ayudar?",
  farewell: "¡Hasta luego! Fue un placer atenderte.",
  tone: "INFORMAL",
  outOfHoursMsg: "Gracias por escribirnos. En este momento estamos fuera de horario, te atenderemos pronto.",
  businessHours: DEFAULT_HOURS,
}

// ─── Live Preview ─────────────────────────────────────────────────────────────

function LivePreview({ config }: { config: AgentConfig }) {
  const pronoun = config.tone === "FORMAL" ? "usted" : "tú"
  return (
    <div className="flex flex-col gap-2 text-sm">
      <p className="text-muted-foreground text-xs mb-1">Vista previa del chat</p>
      {/* Agent salutation */}
      <div className="flex justify-start">
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
          {config.salutation || "…"}
        </div>
      </div>
      {/* Client message */}
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
          Hola, quisiera consultar sobre un producto.
        </div>
      </div>
      {/* Agent reply using tone */}
      <div className="flex justify-start">
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
          {config.tone === "FORMAL"
            ? `Claro, con gusto le ayudo. ¿Qué producto le interesa a usted?`
            : `¡Claro! ¿Qué producto te interesa?`}
        </div>
      </div>
      {/* Client farewell trigger */}
      <div className="flex justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2 max-w-[85%]">
          Gracias, eso es todo.
        </div>
      </div>
      {/* Agent farewell */}
      <div className="flex justify-start">
        <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2 max-w-[85%]">
          {config.farewell || "…"}
        </div>
      </div>
      <p className="text-muted-foreground text-xs mt-2">
        Tono: <span className="font-medium">{config.tone === "FORMAL" ? `Formal (${pronoun})` : `Informal (${pronoun})`}</span>
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AgentSettingsPage() {
  const router = useRouter()
  const [config, setConfig] = useState<AgentConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch("/api/agent-config")
      .then((r) => r.json())
      .then((data) => {
        setConfig({
          salutation: data.salutation ?? DEFAULT_CONFIG.salutation,
          farewell: data.farewell ?? DEFAULT_CONFIG.farewell,
          tone: data.tone ?? DEFAULT_CONFIG.tone,
          outOfHoursMsg: data.outOfHoursMsg ?? DEFAULT_CONFIG.outOfHoursMsg,
          businessHours: data.businessHours ?? DEFAULT_HOURS,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function setField<K extends keyof AgentConfig>(key: K, value: AgentConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function setDaySchedule(dayKey: string, field: keyof DaySchedule, value: string | boolean) {
    const hours = config.businessHours ?? DEFAULT_HOURS
    setConfig((prev) => ({
      ...prev,
      businessHours: {
        ...hours,
        [dayKey]: { ...hours[dayKey], [field]: value },
      },
    }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch("/api/agent-config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-muted-foreground">Cargando…</div>

  const hours = config.businessHours ?? DEFAULT_HOURS

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Configuración del agente</h1>
        <Button variant="outline" onClick={() => router.push("/dashboard/agent/playground")}>
          Probar agente
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Left column: form ── */}
        <div className="flex flex-col gap-6">
          {/* Messages */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mensajes</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Saludo de bienvenida</Label>
                <Textarea
                  rows={2}
                  value={config.salutation}
                  onChange={(e) => setField("salutation", e.target.value)}
                  placeholder="¡Hola! Bienvenido…"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Mensaje de despedida</Label>
                <Textarea
                  rows={2}
                  value={config.farewell}
                  onChange={(e) => setField("farewell", e.target.value)}
                  placeholder="¡Hasta luego!…"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Mensaje fuera de horario</Label>
                <Textarea
                  rows={2}
                  value={config.outOfHoursMsg}
                  onChange={(e) => setField("outOfHoursMsg", e.target.value)}
                  placeholder="Estamos fuera de horario…"
                />
              </div>
            </CardContent>
          </Card>

          {/* Tone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tono</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={config.tone} onValueChange={(v) => setField("tone", v as "FORMAL" | "INFORMAL")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INFORMAL">Informal (tú)</SelectItem>
                  <SelectItem value="FORMAL">Formal (usted)</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Business hours */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Horario de atención</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {DAYS.map(({ key, label }) => {
                const day = hours[key] ?? { open: "09:00", close: "18:00", enabled: false }
                return (
                  <div key={key} className="grid grid-cols-[7rem_1fr_1fr] items-center gap-2">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={(e) => setDaySchedule(key, "enabled", e.target.checked)}
                        className="accent-primary"
                      />
                      {label}
                    </label>
                    <Input
                      type="time"
                      value={day.open}
                      disabled={!day.enabled}
                      onChange={(e) => setDaySchedule(key, "open", e.target.value)}
                      className="text-sm"
                    />
                    <Input
                      type="time"
                      value={day.close}
                      disabled={!day.enabled}
                      onChange={(e) => setDaySchedule(key, "close", e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Button onClick={handleSave} disabled={saving} className="self-start">
            {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar cambios"}
          </Button>
        </div>

        {/* ── Right column: live preview ── */}
        <div className="sticky top-8 self-start">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Vista previa en vivo</CardTitle>
            </CardHeader>
            <CardContent>
              <LivePreview config={config} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
