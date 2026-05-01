import Link from "next/link"

export function Header() {
  return (
    <header className="border-border/40 bg-background/80 sticky top-0 z-50 w-full border-b backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">Vendly</span>
        </div>

        {/* Nav central — solo visible en md+ */}
        <nav className="hidden items-center gap-7 md:flex">
          <Link
            href="#"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Productos
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Cómo funciona
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Testimonios
          </Link>
        </nav>

        {/* Acciones */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
          >
            Ingresar
          </Link>
          <Link
            href="/signup"
            className="bg-foreground text-background inline-flex items-center justify-center rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 hover:bg-[#25D366] hover:text-white"
          >
            Empezar gratis
          </Link>
        </div>
      </div>
    </header>
  )
}
