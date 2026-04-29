import Link from "next/link"

export function Hero() {
  return (
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
  )
}
