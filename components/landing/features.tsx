"use client"

import { motion } from "framer-motion"

import { Sparkles } from "lucide-react"

// ── Mini-UI: Cerebro IA (Extracción de datos) ──
function BrainMini() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-6">
      {/* Mensaje entrante */}
      <motion.div 
        className="w-full max-w-[260px] rounded-2xl rounded-tl-sm bg-muted px-4 py-3 text-[12px] text-foreground shadow-sm"
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        "Quiero 2 pares de las Urban blancas en talla 42, porfa"
      </motion.div>
      
      {/* Extracción de datos */}
      <motion.div 
        className="w-full max-w-[260px] rounded-xl border border-border/50 bg-background p-3.5 shadow-sm"
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        whileHover={{ scale: 1.02 }}
      >
        <div className="mb-2.5 flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          >
            <Sparkles className="size-3.5 text-[#25D366]" />
          </motion.div>
          Datos extraídos
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between text-[11px] border-b border-border/40 pb-1.5">
            <span className="text-muted-foreground">Producto:</span>
            <span className="font-semibold text-foreground">Zapatillas Urban</span>
          </div>
          <div className="flex justify-between text-[11px] border-b border-border/40 pb-1.5">
            <span className="text-muted-foreground">Color:</span>
            <span className="font-semibold text-foreground">Blanco</span>
          </div>
          <div className="flex justify-between text-[11px] border-b border-border/40 pb-1.5">
            <span className="text-muted-foreground">Talla:</span>
            <span className="font-semibold text-foreground">42</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-muted-foreground">Cantidad:</span>
            <span className="font-semibold text-foreground">2</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Mini-UI: Catálogo / Inventario ────────────────────────────────────────────────
function InventoryMini() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-6">
      <div className="w-full max-w-[220px] flex flex-col gap-2.5">
        {/* Item 1 */}
        <motion.div 
          className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-3 shadow-sm"
          whileHover={{ scale: 1.02, x: 4 }}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-semibold text-foreground leading-none">Urban Blancas</span>
            <span className="text-[10px] text-muted-foreground">URB-BL-42</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[12px] font-bold text-foreground leading-none">4</span>
            <motion.span 
              className="text-[9px] font-semibold text-[#25D366] bg-[#25D366]/10 px-1.5 py-0.5 rounded-sm"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              En stock
            </motion.span>
          </div>
        </motion.div>

        {/* Item 2 */}
        <motion.div 
          className="flex items-center justify-between rounded-xl border border-border/50 bg-background p-3 shadow-sm opacity-60"
          whileHover={{ scale: 1.02, x: 4, opacity: 1 }}
          initial={{ opacity: 0, x: -10 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[12px] font-semibold text-foreground leading-none">Pro Negras</span>
            <span className="text-[10px] text-muted-foreground">PRO-NG-40</span>
          </div>
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[12px] font-bold text-foreground leading-none">0</span>
            <span className="text-[9px] font-semibold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-sm">Agotado</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

// ── Mini-UI: Gráfico de barras ─────────────────────────────────────────────────
const BARS = [
  { h: 30, color: "bg-muted" },
  { h: 50, color: "bg-muted-foreground/20" },
  { h: 40, color: "bg-muted" },
  { h: 70, color: "bg-[#25D366]/40" },
  { h: 50, color: "bg-muted-foreground/20" },
  { h: 90, color: "bg-[#25D366]" },
]

function MetricsMini() {
  return (
    <div className="flex h-full w-full items-end justify-center gap-2.5 px-6 pt-8 pb-0">
      {BARS.map(({ h, color }, i) => (
        <motion.div 
          key={i} 
          className={`w-8 ${color} rounded-t-md origin-bottom`} 
          style={{ height: `${h}%` }}
          animate={{ height: [`${h}%`, `${h + (i % 2 === 0 ? 10 : -10)}%`, `${h}%`] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.5, ease: "easeInOut" }}
          whileHover={{ scaleY: 1.1 }}
        />
      ))}
    </div>
  )
}

// ── Mini-UI: Kanban / Notificaciones apiladas ──────────────────────────────────
const ORDERS = [
  { id: "#1044", status: "Nuevo",      label: "Zapatillas Blancas", dot: "bg-[#25D366]" },
  { id: "#1043", status: "Empacando",  label: "Camiseta Básica M",  dot: "bg-muted-foreground/40" },
  { id: "#1042", status: "Entregado",  label: "Pantalón Cargo",     dot: "bg-muted-foreground/20" },
]

function KanbanMini() {
  return (
    <div className="flex h-full w-full flex-col justify-center gap-2.5 p-6">
      {ORDERS.map(({ id, status, label, dot }, i) => (
        <motion.div
          key={id}
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-background px-4 py-3 shadow-sm"
          whileHover={{ x: 4 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <motion.span 
            className={`size-2 shrink-0 rounded-full ${dot}`} 
            animate={id === "#1044" ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-foreground leading-none">{id}</span>
              <span className="text-[10px] text-muted-foreground">{status}</span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate">{label}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ── Sección principal ──────────────────────────────────────────────────────────
export function Features() {
  return (
    <section className="border-t border-border/40 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Encabezado */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que necesitas, sin la complejidad
          </h2>
          <p className="text-muted-foreground text-lg">
            Una plataforma completa para que tu negocio venda 24/7 en WhatsApp.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {/* Tarjeta 1 — 2 columnas: Agente IA */}
          <motion.div 
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card md:col-span-2 shadow-sm"
            whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-1 bg-muted/30 relative overflow-hidden min-h-[220px]">
              <BrainMini />
            </div>
            <div className="border-t border-border/50 px-8 py-7 bg-card">
              <h3 className="mb-2 text-xl font-bold tracking-tight">Cerebro de Inteligencia Artificial</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Entiende el contexto, resuelve dudas y guía al cliente hacia la compra sin que tengas que intervenir.
              </p>
            </div>
          </motion.div>

          {/* Tarjeta 2 — 1 columna: Catálogo */}
          <motion.div 
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-1 bg-muted/30 relative overflow-hidden min-h-[220px]">
              <InventoryMini />
            </div>
            <div className="border-t border-border/50 px-8 py-7 bg-card">
              <h3 className="mb-2 text-xl font-bold tracking-tight">Catálogo Inteligente</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Tu inventario sincronizado. El bot solo ofrece lo que tienes en stock.
              </p>
            </div>
          </motion.div>

          {/* Tarjeta 3 — 1 columna: Métricas */}
          <motion.div 
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-sm"
            whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-1 bg-muted/30 relative overflow-hidden min-h-[220px]">
              <MetricsMini />
            </div>
            <div className="border-t border-border/50 px-8 py-7 bg-card">
              <h3 className="mb-2 text-xl font-bold tracking-tight">Métricas en Vivo</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Visualiza ventas y conversiones desde tu dashboard en tiempo real.
              </p>
            </div>
          </motion.div>

          {/* Tarjeta 4 — 2 columnas: Gestión de pedidos */}
          <motion.div 
            className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card md:col-span-2 shadow-sm"
            whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex-1 bg-muted/30 relative overflow-hidden min-h-[220px]">
              <KanbanMini />
            </div>
            <div className="border-t border-border/50 px-8 py-7 bg-card">
              <h3 className="mb-2 text-xl font-bold tracking-tight">Gestión de Pedidos</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Cada venta queda registrada automáticamente. Sigue el estado de cada pedido desde un solo lugar.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
