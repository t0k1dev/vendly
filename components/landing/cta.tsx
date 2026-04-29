import Link from "next/link"

export function Cta() {
  return (
    <section className="py-24 relative overflow-hidden bg-foreground text-background">
      {/* Elementos decorativos estilo WhatsApp pero integrados en el tema oscuro */}
      <div className="absolute -top-24 -right-24 w-[500px] h-[500px] bg-[#25D366]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-[500px] h-[500px] bg-[#25D366]/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center z-10">
        <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
          Deja de perder ventas por no responder a tiempo
        </h2>
        <p className="text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Únete a cientos de tiendas en LATAM que ya automatizaron su canal de ventas más importante con Vendly.
        </p>
        <Link
          href="/signup"
          className="inline-flex items-center justify-center rounded-full bg-[#25D366] text-white text-lg font-bold px-10 py-5 hover:bg-[#1EBE5A] hover:scale-105 transition-all duration-300 shadow-2xl shadow-[#25D366]/20"
        >
          Crear mi agente gratis
        </Link>
        <p className="mt-6 text-sm text-zinc-500 font-medium">
          Sin tarjeta de crédito • Configuración en menos de 5 minutos
        </p>
      </div>
    </section>
  )
}
