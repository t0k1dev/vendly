import Link from "next/link"

export function Header() {
  return (
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
  )
}
