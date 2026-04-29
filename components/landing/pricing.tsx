"use client"

import { Check } from "lucide-react"
import { motion } from "framer-motion"

const PLANS = [
  {
    name: "Básico",
    price: "$29",
    period: "/mes",
    description: "Para negocios que están empezando a automatizar su atención.",
    cta: "Empezar gratis",
    ctaStyle: "border border-border hover:bg-muted text-foreground",
    featured: false,
    features: [
      "1 número de WhatsApp",
      "Hasta 500 conversaciones/mes",
      "Catálogo de hasta 50 productos",
      "Dashboard básico",
      "Soporte por email",
    ],
  },
  {
    name: "Pro",
    price: "$79",
    period: "/mes",
    description: "Para negocios que quieren escalar ventas sin límites operativos.",
    cta: "Empezar con Pro",
    ctaStyle: "bg-primary text-primary-foreground hover:opacity-90",
    featured: true,
    features: [
      "3 números de WhatsApp",
      "Conversaciones ilimitadas",
      "Catálogo ilimitado + variantes",
      "CRM inteligente incluido",
      "Métricas y reportes avanzados",
      "Integraciones con tu tienda",
      "Soporte prioritario 24/7",
    ],
  },
]

export function Pricing() {
  return (
    <section className="py-24 sm:py-32 border-t border-border/40">
      <div className="max-w-5xl mx-auto px-6">
        <div className="max-w-xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
            Precios simples, sin sorpresas
          </h2>
          <p className="text-muted-foreground text-lg">
            Empieza gratis 14 días en cualquier plan. Sin tarjeta de crédito.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {PLANS.map(({ name, price, period, description, cta, ctaStyle, featured, features }, i) => (
            <motion.div
              key={name}
              className={`relative rounded-3xl border bg-card p-8 flex flex-col gap-8 ${
                featured
                  ? "border-foreground shadow-lg shadow-black/[0.04]"
                  : "border-border"
              }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              whileHover={{ scale: 1.01 }}
            >
              {/* Badge "Más popular" */}
              {featured && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground">
                    Más popular
                  </span>
                </div>
              )}

              {/* Nombre + precio */}
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                  {name}
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-5xl font-semibold tracking-tight text-foreground">{price}</span>
                  <span className="text-muted-foreground mb-1.5">{period}</span>
                </div>
                <p className="text-muted-foreground text-sm">{description}</p>
              </div>

              {/* CTA */}
              <a
                href="/signup"
                className={`inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all ${ctaStyle}`}
              >
                {cta}
              </a>

              {/* Features */}
              <ul className="flex flex-col gap-3">
                {features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <Check className="size-4 shrink-0 text-[#25D366] mt-0.5" />
                    <span className="text-foreground">{f}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
