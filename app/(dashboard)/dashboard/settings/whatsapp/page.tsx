"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

type Session = { phoneNumberId: string; connected: boolean } | null

const schema = z.object({
  phoneNumberId: z.string().min(1, "Phone Number ID requerido"),
  token: z.string().min(1, "Token requerido"),
})
type FormData = z.infer<typeof schema>

export default function WhatsAppSettingsPage() {
  const [session, setSession] = useState<Session>(undefined as unknown as Session)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    fetch("/api/whatsapp/status")
      .then((r) => r.json())
      .then((d) => { setSession(d.session ?? null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const onSubmit = async (data: FormData) => {
    setSaving(true); setError(null); setSuccess(false)
    const res = await fetch("/api/whatsapp/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    setSaving(false)
    if (!res.ok) { setError(json.error ?? "Error al conectar"); return }
    setSession({ phoneNumberId: data.phoneNumberId, connected: true })
    setSuccess(true)
  }

  const handleDisconnect = async () => {
    setSaving(true)
    await fetch("/api/whatsapp/disconnect", { method: "POST" })
    setSaving(false)
    setSession(null)
    setSuccess(false)
  }

  if (loading) return <div className="p-8 text-sm text-gray-500">Cargando...</div>

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">WhatsApp</h1>

      {/* Status card */}
      <Card className="mb-6">
        <CardContent className="p-4 flex items-center gap-3">
          <div className={`h-3 w-3 rounded-full ${session?.connected ? "bg-green-500" : "bg-gray-300"}`} />
          <span className="text-sm font-medium">
            {session?.connected
              ? `Conectado · ${session.phoneNumberId}`
              : "No conectado"}
          </span>
        </CardContent>
      </Card>

      {session?.connected ? (
        <Button variant="outline" onClick={handleDisconnect} disabled={saving}>
          {saving ? "Desconectando..." : "Desconectar"}
        </Button>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conectar WhatsApp</CardTitle>
            <CardDescription className="text-sm">
              Ingresa las credenciales de tu cuenta de Meta Cloud API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1">
                <Label>Phone Number ID</Label>
                <Input placeholder="Ej: 123456789012345" {...register("phoneNumberId")} />
                {errors.phoneNumberId && (
                  <p className="text-xs text-red-500">{errors.phoneNumberId.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label>Token de acceso</Label>
                <Input type="password" placeholder="EAAxxxxxx..." {...register("token")} />
                {errors.token && (
                  <p className="text-xs text-red-500">{errors.token.message}</p>
                )}
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">¡Conectado exitosamente!</p>}
              <Button type="submit" disabled={saving}>
                {saving ? "Conectando..." : "Conectar"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
