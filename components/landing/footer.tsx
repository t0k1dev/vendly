import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t">
      <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} Vendly</span>
        <div className="flex gap-4">
          <Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
          <Link href="/signup" className="hover:text-foreground transition-colors">Registrarse</Link>
        </div>
      </div>
    </footer>
  )
}
