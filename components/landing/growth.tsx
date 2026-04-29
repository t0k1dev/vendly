const METRICS = [
  { value: "2x",   label: "Incremento en conversión" },
  { value: "+90%", label: "Satisfacción del cliente" },
  { value: "24/7", label: "Disponibilidad del agente" },
  { value: "-65%", label: "Tiempo de respuesta manual" },
]

export function Growth() {
  return (
    <section className="border-t border-border/40 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-6">
        {/* Encabezado */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Growth en cada conversación
          </h2>
          <p className="text-muted-foreground text-lg">
            Resultados reales de negocios que ya automatizaron sus ventas con Vendly.
          </p>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-2 lg:gap-16">
          {/* Lado izquierdo — Métricas 2x2 limpias */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-12">
            {METRICS.map(({ value, label }, i) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-extrabold tracking-tight text-foreground">
                    {value}
                  </span>
                  {/* Pequeño toque verde del primer elemento para romper la monotonía */}
                  {i === 0 && (
                    <span className="flex size-2 shrink-0 rounded-full bg-[#25D366]" />
                  )}
                </div>
                <span className="text-muted-foreground text-sm leading-snug">
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Lado derecho — Visual de caso de uso elegante */}
          <div className="flex flex-col gap-6">
            {/* Contenedor tipo "tarjeta en tarjeta" */}
            <div className="flex items-center justify-center overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm">
              <div className="relative flex aspect-[4/3] w-full max-w-sm flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl bg-muted/50 border border-border/50">
                {/* Logo abstracto central */}
                <div className="flex size-14 items-center justify-center rounded-2xl bg-foreground shadow-lg">
                  <span className="text-2xl font-bold text-background">V</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 w-full">
                  <div className="h-2.5 w-24 rounded-full bg-muted-foreground/30" />
                  <div className="h-2 w-16 rounded-full bg-muted-foreground/20" />
                </div>
                {/* Check verde decorativo */}
                <div className="absolute top-4 right-4 flex size-6 items-center justify-center rounded-full bg-[#25D366]/10">
                  <div className="size-2 rounded-full bg-[#25D366]" />
                </div>
              </div>
            </div>

            {/* Texto del caso */}
            <div className="flex flex-col gap-3 pl-2">
              <p className="text-xl font-bold leading-snug tracking-tight text-foreground">
                "Ayudamos a los compradores a encontrar su talla ideal — sin intervención humana."
              </p>
              <button className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 self-start text-sm font-semibold transition-colors">
                Leer caso de éxito <span className="text-xl leading-none">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
