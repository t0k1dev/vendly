"use client"

import { Check } from "lucide-react"
import { motion } from "framer-motion"

export function Cta() {
  return (
    <section className="py-24 sm:py-32 bg-foreground">
      <motion.div 
        className="max-w-3xl mx-auto px-6 text-center flex flex-col items-center gap-8"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col gap-4">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-background">
            Empieza a vender en automático hoy.
          </h2>
          <p className="text-background/70 text-lg">
            Configura tu agente en menos de 5 minutos. Sin tarjeta de crédito.
          </p>
        </div>

        {/* Formulario inline */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <input
            type="email"
            placeholder="tu@email.com"
            className="flex-1 rounded-full bg-background/10 border border-background/20 px-5 py-3 text-sm text-background placeholder:text-background/50 outline-none focus:border-background/40 transition-colors"
          />
          <button className="inline-flex items-center justify-center rounded-full bg-[#25D366] text-white text-sm font-semibold px-6 py-3 hover:bg-[#20bd5a] transition-colors shrink-0">
            Crear cuenta gratis
          </button>
        </div>

        {/* Trust text */}
        <div className="flex items-center gap-2">
          <Check className="size-3.5 text-[#25D366] shrink-0" />
          <p className="text-xs text-background/50">
            Prueba gratis por 14 días. Cancela cuando quieras.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
