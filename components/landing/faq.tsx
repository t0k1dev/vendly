"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { motion } from "framer-motion"

const FAQS = [
  {
    q: "¿Necesito saber programar?",
    a: "No. Vendly está diseñado para dueños de negocio. Configurás catálogo, tono y horarios desde un panel visual, sin código.",
  },
  {
    q: "¿Qué pasa si el agente no sabe la respuesta?",
    a: "El agente escala al humano cuando detecta una consulta fuera de rango. El cliente recibe una respuesta honesta y vos una notificación.",
  },
  {
    q: "¿Puedo probarlo antes de pagar?",
    a: "Sí. Cualquier plan incluye 14 días gratis sin tarjeta de crédito. Todas las funcionalidades disponibles desde el primer día.",
  },
  {
    q: "¿Funciona con mi número actual de WhatsApp?",
    a: "Sí. Conectás tu número actual via la API oficial de WhatsApp Business en menos de 10 minutos, sin perder chats.",
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
          Preguntas Frecuentes
        </h2>
        <div className="flex flex-col">
          {FAQS.map(({ q, a }, i) => (
            <motion.div 
              key={i} 
              className="border-b border-border"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <button
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="font-semibold text-foreground">{q}</span>
                <ChevronDown
                  className={`size-4 shrink-0 text-muted-foreground transition-transform duration-300 ${
                    open === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-in-out ${
                  open === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden min-h-0">
                  <p className="pb-5 text-muted-foreground leading-relaxed">{a}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
