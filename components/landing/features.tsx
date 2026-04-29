import { MessageCircle, Package, ShoppingCart, Users, Bot, TrendingUp } from "lucide-react"

const FEATURES = [
  {
    icon: Bot,
    title: "Agente IA por WhatsApp",
    description: "Tu asistente virtual atiende clientes, resuelve dudas y toma pedidos automáticamente, las 24 horas.",
  },
  {
    icon: Package,
    title: "Catálogo inteligente",
    description: "El agente conoce tu inventario en tiempo real: precios, stock, categorías y disponibilidad.",
  },
  {
    icon: ShoppingCart,
    title: "Pedidos automáticos",
    description: "Los pedidos de WhatsApp se registran solos en tu panel. Sin tipear, sin errores.",
  },
  {
    icon: Users,
    title: "Mini CRM incluido",
    description: "Historial de cada cliente, tags, notas y métricas de compra — todo centralizado.",
  },
  {
    icon: TrendingUp,
    title: "Dashboard en tiempo real",
    description: "Ingresos, pedidos por estado, clientes nuevos y top productos en un solo vistazo.",
  },
  {
    icon: MessageCircle,
    title: "Configuración sin código",
    description: "Personaliza el tono, horarios y mensajes de tu agente desde el panel en minutos.",
  },
]

export function Features() {
  return (
    <section className="border-t bg-muted/30">
      <div className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-bold text-center mb-12">Todo lo que necesitas para vender por WhatsApp</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="rounded-xl border bg-background p-6 space-y-3">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
