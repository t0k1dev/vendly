"use client"

import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function DashboardPage() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Bienvenido a Vendly.</p>
      <div className="flex gap-3 mt-2">
        <Button onClick={() => router.push("/dashboard/products")}>
          Mis productos
        </Button>
        <Button variant="outline" onClick={() => router.push("/dashboard/settings/whatsapp")}>
          WhatsApp
        </Button>
        <Button variant="outline" onClick={handleLogout}>
          Cerrar sesión
        </Button>
      </div>
    </main>
  )
}
