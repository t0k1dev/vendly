import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-background border-t border-border/40 pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-6 rounded bg-[#25D366] flex items-center justify-center">
                <span className="text-white font-bold text-xs leading-none">V</span>
              </div>
              <span className="text-xl font-bold tracking-tight">Vendly</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              El agente de IA diseñado exclusivamente para e-commerce en LATAM. Vende, atiende y gestiona todo automáticamente desde WhatsApp.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Producto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-[#25D366] transition-colors">Características</Link></li>
              <li><Link href="#" className="hover:text-[#25D366] transition-colors">Precios</Link></li>
              <li><Link href="#" className="hover:text-[#25D366] transition-colors">Casos de Uso</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Compañía</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/login" className="hover:text-[#25D366] transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/signup" className="hover:text-[#25D366] transition-colors">Registrarse</Link></li>
              <li><Link href="#" className="hover:text-[#25D366] transition-colors">Contacto</Link></li>
            </ul>
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Vendly. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-foreground transition-colors">Privacidad</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Términos del Servicio</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
