import { MessageCircle, Package, ShoppingCart, Users, Bot, Zap } from "lucide-react"

const FEATURES = [
  {
    icon: Bot,
    title: "Agente IA Autónomo",
    description: "Responde de forma natural, entiende el contexto y cierra ventas como un humano, pero disponible 24/7 sin descanso.",
  },
  {
    icon: Package,
    title: "Sincronización de Stock",
    description: "El agente solo ofrece lo que realmente tienes. Conectado a tu catálogo en tiempo real para evitar ventas sin stock.",
  },
  {
    icon: ShoppingCart,
    title: "Gestión de Pedidos Automática",
    description: "Cada compra confirmada por WhatsApp genera un pedido estructurado en tu dashboard listo para despachar.",
  },
  {
    icon: Users,
    title: "CRM Inteligente Incorporado",
    description: "Guarda el historial, preferencias, tallas y comportamientos de tus clientes automáticamente en cada interacción.",
  },
  {
    icon: Zap,
    title: "Respuestas Instantáneas",
    description: "No más clientes esperando horas. Vendly responde en segundos con la información correcta y precisa.",
  },
  {
    icon: MessageCircle,
    title: "Control Sin Programación",
    description: "Configura el tono de voz, horarios y reglas de tu agente desde una interfaz limpia, sin escribir una línea de código.",
  },
]

export function Features() {
  return (
    <section className="py-24 sm:py-32 bg-background border-t border-border/40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
            Todo lo que necesitas, <br className="hidden sm:block" /> sin la complejidad
          </h2>
          <p className="text-lg text-muted-foreground">
            Diseñado meticulosamente para que te enfoques en hacer crecer tu negocio, mientras Vendly maneja toda la atención operativa.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group relative flex flex-col gap-4">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted border border-border/50 group-hover:bg-[#25D366] group-hover:text-white transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#25D366]/20">
                <Icon className="size-6 text-foreground group-hover:text-white transition-colors duration-300" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-2">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
