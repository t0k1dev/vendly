"use client"

import { Star } from "lucide-react"
import { motion } from "framer-motion"

const TESTIMONIALS = [
  {
    text: "Desde que activamos Vendly, nuestras ventas nocturnas se triplicaron. El bot responde mejor que yo a las 2am.",
    name: "Valentina Torres",
    role: "Dueña · Moda & Co.",
    initial: "V",
  },
  {
    text: "Configurarlo fue sorprendentemente fácil. En menos de 20 minutos ya estaba tomando pedidos automáticamente.",
    name: "Carlos Medina",
    role: "Gerente · FarmaRed",
    initial: "C",
  },
  {
    text: "Nuestros clientes piensan que tenemos un equipo de atención enorme. En realidad es solo Vendly y yo.",
    name: "Luisa Herrera",
    role: "Fundadora · RestoCentro",
    initial: "L",
  },
]

export function Testimonials() {
  return (
    <section className="border-t border-border/40 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Lo que dicen las tiendas que ya venden en automático
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map(({ text, name, role, initial }, i) => (
            <motion.div
              key={name}
              className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1)" }}
            >
              {/* Estrellas minimalistas */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-[#25D366] text-[#25D366]" />
                ))}
              </div>

              {/* Testimonio */}
              <p className="text-muted-foreground flex-1 leading-relaxed">
                "{text}"
              </p>

              {/* Avatar monocromático + datos */}
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground">
                  {initial}
                </div>
                <div>
                  <p className="font-bold leading-none text-foreground">{name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
