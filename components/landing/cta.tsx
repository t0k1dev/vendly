import Link from "next/link"

export function Cta() {
  return (
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
  )
}
