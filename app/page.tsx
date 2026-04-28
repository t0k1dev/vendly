import Link from "next/link"
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold tracking-tight">Vendly</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-foreground text-background text-sm font-medium px-4 py-2 hover:bg-foreground/90 transition-colors"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-muted-foreground mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          Disponible para tiendas en LATAM
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6 max-w-2xl mx-auto">
          Tu tienda vende sola por WhatsApp
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
          Vendly conecta un agente de IA a tu cuenta de WhatsApp Business. Atiende clientes, muestra productos y registra pedidos — sin que tengas que estar pendiente.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-foreground text-background text-sm font-medium px-6 py-3 hover:bg-foreground/90 transition-colors w-full sm:w-auto"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border text-sm font-medium px-6 py-3 hover:bg-muted transition-colors w-full sm:w-auto"
          >
            Ya tengo cuenta
          </Link>
        </div>
      </section>

      {/* Features */}
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

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">Empieza hoy, gratis</h2>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Configura tu agente en menos de 5 minutos. Sin tarjeta de crédito.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-lg bg-foreground text-background text-sm font-medium px-8 py-3 hover:bg-foreground/90 transition-colors"
        >
          Crear cuenta gratis
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Vendly</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Registrarse</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
