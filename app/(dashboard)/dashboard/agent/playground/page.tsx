"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type HistoryEntry = { role: "user" | "assistant"; content: string }

type Message = {
  id: number
  role: "user" | "assistant"
  content: string
  toolsUsed?: string[]
  debugOpen?: boolean
}

let msgId = 0

export default function PlaygroundPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  function getHistory(): HistoryEntry[] {
    return messages.map((m) => ({ role: m.role, content: m.content }))
  }

  async function sendMessage() {
    if (!input.trim() || loading) return
    const text = input.trim()
    setInput("")
    const userMsg: Message = { id: ++msgId, role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setLoading(true)

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientPhone: "playground",
          message: text,
          playground: true,
          history: getHistory(),
        }),
      })
      const data = await res.json()
      const botMsg: Message = {
        id: ++msgId,
        role: "assistant",
        content: data.reply ?? "Sin respuesta.",
        toolsUsed: data.toolsUsed ?? [],
        debugOpen: false,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: ++msgId, role: "assistant", content: "Error al conectar con el agente.", toolsUsed: [] },
      ])
    } finally {
      setLoading(false)
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
    }
  }

  function toggleDebug(id: number) {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, debugOpen: !m.debugOpen } : m))
    )
  }

  function reset() {
    setMessages([])
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
        <h1 className="text-lg font-semibold">Playground del agente</h1>
        <Button variant="outline" size="sm" onClick={reset}>
          Reiniciar conversación
        </Button>
      </div>

      {/* Test mode banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-amber-800 text-sm text-center">
        Modo prueba — los mensajes no se envían por WhatsApp ni crean pedidos o clientes reales
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-muted-foreground text-sm mt-12">
            Escribe un mensaje para probar tu agente
          </p>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className="max-w-[75%] space-y-1">
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
              >
                {m.content}
              </div>

              {m.role === "assistant" && m.toolsUsed && m.toolsUsed.length > 0 && (
                <div className="text-xs">
                  <button
                    onClick={() => toggleDebug(m.id)}
                    className="text-muted-foreground hover:text-foreground underline underline-offset-2"
                  >
                    {m.debugOpen ? "Ocultar" : "Ver"} herramientas usadas ({m.toolsUsed.length})
                  </button>
                  {m.debugOpen && (
                    <div className="mt-1 bg-muted/60 border rounded px-3 py-2 font-mono space-y-0.5">
                      {m.toolsUsed.map((t, i) => (
                        <div key={i} className="text-muted-foreground">→ {t}</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {m.role === "assistant" && (!m.toolsUsed || m.toolsUsed.length === 0) && (
                <p className="text-xs text-muted-foreground/60 pl-1">Sin herramientas</p>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-muted-foreground animate-pulse">
              Escribiendo…
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t px-4 py-4 bg-background flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe un mensaje…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          disabled={loading}
          autoFocus
        />
        <Button onClick={sendMessage} disabled={loading || !input.trim()}>
          Enviar
        </Button>
      </div>
    </div>
  )
}
