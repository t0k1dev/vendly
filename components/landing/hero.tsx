"use client"

import Link from "next/link"
import { MessageSquare, TrendingUp, ShoppingBag, Star, SendHorizontal } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { RotatingWord } from "@/components/landing/rotating-word"

import { useState, useEffect } from "react"

// ── Tarjeta flotante: Gráfica de ventas ───────────────────────────────────────
function SalesCard() {
  const points = "0,35 15,28 30,32 45,18 60,22 80,8"

  return (
    <motion.div
      className="border-border bg-background/95 flex w-44 flex-col gap-2 rounded-2xl border p-4 shadow-xl shadow-black/[0.08] backdrop-blur-sm"
      // Flotación suave: sube y baja infinitamente
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-medium">Ventas</span>
        <div className="flex items-center gap-1 rounded-full bg-[#25D366]/10 px-2 py-0.5">
          <TrendingUp className="size-3 text-[#25D366]" />
          <span className="text-[10px] font-bold text-[#25D366]">+15%</span>
        </div>
      </div>
      <svg viewBox="0 0 80 40" className="h-10 w-full" fill="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#25D366" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#25D366" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={`0,35 ${points} 80,40 0,40`} fill="url(#chartGrad)" />
        <polyline
          points={points}
          stroke="#25D366"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-foreground text-[11px] font-semibold">esta semana</p>
    </motion.div>
  )
}

// ── Tarjeta flotante: Notificación de pedido ─────────────────────────────────
function OrderCard() {
  return (
    <motion.div
      className="border-border bg-background/95 flex w-52 items-start gap-3 rounded-2xl border p-3.5 shadow-xl shadow-black/[0.08] backdrop-blur-sm"
      // Fase distinta para que no floten sincronizadas
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
    >
      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]/10">
        <ShoppingBag className="size-4 text-[#25D366]" />
      </div>
      <div className="min-w-0">
        <p className="text-foreground text-xs leading-snug font-semibold">🎉 Nuevo pedido</p>
        <p className="text-muted-foreground text-xs leading-snug">#1234 · $45.00</p>
        <p className="text-muted-foreground/60 mt-1 text-[10px]">hace 2 min · vía WhatsApp</p>
      </div>
    </motion.div>
  )
}

// ── Indicador de escritura ────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-muted flex items-center gap-1.5 rounded-2xl rounded-tl-sm px-3.5 py-3">
        {[0, 150, 300].map((delay) => (
          <motion.span
            key={delay}
            className="bg-muted-foreground/50 block size-1.5 rounded-full"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, ease: "easeInOut", delay: delay / 1000 }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Mockup de teléfono con chat animado ──────────────────────────────────────
const CHAT_STEPS = [
  { from: "user", text: "Tienen zapatillas blancas talla 42? 👟" },
  { from: "typing", text: "" },
  { from: "bot", text: "¡Hola! Sí, tenemos las Urban Pro Blancas en talla 42 😊" },
  { from: "bot", text: "💰 $85 USD · 📦 4 en stock\n¿Registro el pedido ahora?" },
]

// Tiempo en ms entre cada paso (más lento)
const STEP_DELAYS = [1200, 800, 1500, 1800]

function PhoneMockup() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (step >= CHAT_STEPS.length) return

    const timer = setTimeout(() => {
      setStep((prev) => prev + 1)
    }, STEP_DELAYS[step])

    return () => clearTimeout(timer)
  }, [step])

  // Cuando llega al final, reinicia el loop después de una pausa
  useEffect(() => {
    if (step < CHAT_STEPS.length) return
    const reset = setTimeout(() => setStep(0), 3500)
    return () => clearTimeout(reset)
  }, [step])

  // Los mensajes visibles son los pasos completados (excluyendo el typing si ya pasó)
  const visibleMessages = CHAT_STEPS.slice(0, step).filter((s) => s.from !== "typing")
  const showTyping = step < CHAT_STEPS.length && CHAT_STEPS[step]?.from === "typing"

  return (
    <div className="border-border/60 bg-background relative w-[288px] overflow-hidden rounded-3xl border shadow-2xl shadow-black/[0.1]">
      {/* Notch */}
      <div className="bg-background flex justify-center pt-3 pb-2">
        <div className="bg-border/80 h-1 w-14 rounded-full" />
      </div>

      {/* Header del chat */}
      <div className="bg-muted/40 border-border flex items-center gap-2.5 border-b px-4 py-2.5">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
          <span className="text-xs font-bold text-white">V</span>
        </div>
        <div className="flex-1 text-left">
          <p className="text-foreground text-[13px] leading-none font-semibold">Vendly IA</p>
          <div className="mt-0.5 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-[#25D366]" />
            <p className="text-muted-foreground text-[11px]">en línea</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-muted-foreground/25 size-1 rounded-full" />
          ))}
        </div>
      </div>

      {/* Área de mensajes — altura fija para que el layout no salte */}
      <div className="bg-background flex min-h-[260px] flex-col gap-2.5 px-3.5 pt-4 pb-2">
        <AnimatePresence>
          {visibleMessages.map((msg, i) => (
            <motion.div
              key={i}
              className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {msg.from === "user" ? (
                <p className="max-w-[80%] rounded-2xl rounded-tr-sm bg-[#25D366] px-3.5 py-2 text-left text-[12px] leading-relaxed text-white">
                  {msg.text}
                </p>
              ) : (
                <p className="bg-muted text-foreground max-w-[82%] rounded-2xl rounded-tl-sm px-3.5 py-2 text-left text-[12px] leading-relaxed whitespace-pre-line">
                  {msg.text}
                </p>
              )}
            </motion.div>
          ))}

          {showTyping && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
            >
              <TypingIndicator />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input bar */}
      <div className="bg-muted/40 border-border flex items-center gap-2 border-t px-3 py-2">
        <div className="bg-background border-border text-muted-foreground flex flex-1 items-center rounded-full border px-3 py-1.5 text-[11px]">
          Escribe un mensaje...
        </div>
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
          <SendHorizontal className="size-3 text-white" />
        </div>
      </div>
    </div>
  )
}

// ── Logos placeholder ─────────────────────────────────────────────────────────
const BRAND_PLACEHOLDERS = [
  { label: "Moda & Co.", initial: "M" },
  { label: "FarmaRed", initial: "F" },
  { label: "RestoCentro", initial: "R" },
  { label: "ClinicaPro", initial: "C" },
  { label: "TechStore", initial: "T" },
  { label: "NutriLife", initial: "N" },
]

// ── Hero principal ────────────────────────────────────────────────────────────
export function Hero() {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-0 lg:pt-28">
        {/* ── 1. Prueba social ── */}
        <motion.div
          className="mb-10 flex justify-center"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          <div className="border-border text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium">
            <Star className="text-muted-foreground size-3.5" />
            <span>+500 negocios confían en Vendly</span>
          </div>
        </motion.div>

        {/* ── 2. Tipografía ── */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
        >
          <h1 className="mx-auto mb-5 max-w-4xl text-5xl leading-[1.1] font-semibold tracking-tight sm:text-6xl lg:text-[4.5rem]">
            {/*
              Sin salto de línea ni espacio entre "Tu" y el span:
              JSX colapsa los saltos de línea en un espacio en blanco,
              por eso usamos la expresión {"Tu"} seguida del componente en la misma línea.
              RotatingWord ya lleva min-w internamente.
            */}
            {"Tu "}
            <RotatingWord />
            <span className="block mt-1 sm:mt-0">vende sola por WhatsApp</span>
          </h1>

          <p className="text-muted-foreground mx-auto mb-9 max-w-2xl text-base leading-relaxed sm:text-lg">
            Conecta un agente de IA a tu cuenta. Atiende clientes, muestra tu catálogo y cierra
            pedidos — sin que estés pendiente.
          </p>

          {/* ── 3. Botones ── */}
          <motion.div
            className="mb-16 flex flex-col items-center justify-center gap-3 sm:flex-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.22 }}
          >
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground inline-flex w-full items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition-opacity hover:opacity-90 sm:w-auto"
            >
              Empezar gratis
            </Link>
            <Link
              href="#"
              className="border-border hover:bg-muted inline-flex w-full items-center justify-center gap-2 rounded-full border px-7 py-3 text-sm font-medium transition-colors sm:w-auto"
            >
              <MessageSquare className="size-4 text-[#25D366]" />
              Probar demo en WhatsApp
            </Link>
          </motion.div>
        </motion.div>

        {/* ── 4. Composición visual ── */}
        <div className="relative flex justify-center">
          {/*
            Halos de fondo orgánicos — dos esferas difusas para dar profundidad.
            Están posicionados detrás del teléfono (z-0).
          */}
          <div className="pointer-events-none absolute -top-10 left-1/2 z-0 h-[400px] w-[600px] -translate-x-1/2">
            <div className="absolute top-0 left-1/4 h-72 w-72 rounded-full bg-[#25D366]/10 blur-[80px]" />
            <div className="absolute top-8 right-1/4 h-56 w-56 rounded-full bg-slate-200/50 blur-[80px] dark:bg-slate-700/30" />
          </div>

          {/* Contenedor principal con tarjetas flotantes — z-10 */}
          <div className="relative z-10 flex items-center justify-center">
            {/* Tarjeta izquierda — solo visible en lg+ */}
            <div className="absolute top-1/2 -left-52 hidden -translate-y-1/2 lg:flex">
              <SalesCard />
            </div>

            {/* Teléfono central */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.35 }}
            >
              <PhoneMockup />
            </motion.div>

            {/* Tarjeta derecha — solo visible en lg+ */}
            <div className="absolute top-1/3 -right-56 hidden -translate-y-1/2 lg:flex">
              <OrderCard />
            </div>
          </div>
        </div>

        {/* ── 5. Trusted by ── */}
        <div className="pt-20 pb-16">
          <p className="text-muted-foreground/60 mb-8 text-center text-xs font-medium tracking-widest uppercase">
            Empresas que automatizan con Vendly
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {BRAND_PLACEHOLDERS.map(({ label, initial }) => (
              <div
                key={label}
                className="flex items-center gap-2 opacity-40 transition-opacity hover:opacity-70"
              >
                {/* Logo placeholder: cuadrado con inicial */}
                <div className="bg-muted-foreground/20 flex size-6 items-center justify-center rounded">
                  <span className="text-muted-foreground text-[10px] font-bold">{initial}</span>
                </div>
                <span className="text-muted-foreground text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
