"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseClient } from "@/lib/supabase/client"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Bot,
  Settings,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/products", label: "Productos", icon: Package },
  { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingCart },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/agent/playground", label: "Playground", icon: Bot },
]

const SETTINGS_ITEMS = [
  { href: "/dashboard/settings/agent", label: "Agente", icon: Bot },
  { href: "/dashboard/settings/whatsapp", label: "WhatsApp", icon: MessageCircle },
]

type Store = { name: string }

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [store, setStore] = useState<Store | null>(null)

  useEffect(() => {
    fetch("/api/store/current")
      .then((r) => r.json())
      .then((d) => setStore(d?.store ?? null))
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    const supabase = createSupabaseClient()
    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const isActive = (href: string, exact = false) => {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  const NavLink = ({
    href,
    label,
    icon: Icon,
    exact = false,
  }: {
    href: string
    label: string
    icon: React.ElementType
    exact?: boolean
  }) => {
    const active = isActive(href, exact)
    const link = (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          active
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <Icon className="size-4 shrink-0" />
        {!collapsed && <span>{label}</span>}
      </Link>
    )

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger render={link} />
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      )
    }
    return link
  }

  const initials = store?.name
    ? store.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : "V"

  return (
    <aside
      className={cn(
        "relative flex h-screen flex-col border-r bg-background transition-all duration-200",
        collapsed ? "w-14" : "w-56"
      )}
    >
      {/* Logo */}
      <div className={cn("flex h-14 items-center border-b px-4", collapsed && "justify-center px-0")}>
        {collapsed ? (
          <span className="text-lg font-bold text-primary">V</span>
        ) : (
          <span className="text-lg font-bold tracking-tight">Vendly</span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex flex-col gap-1 p-2 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.href} {...item} />
        ))}

        {/* Settings group */}
        <div className={cn("mt-4", !collapsed && "px-1")}>
          {!collapsed && (
            <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              Configuración
            </p>
          )}
          {collapsed && <div className="my-2 border-t" />}
          {SETTINGS_ITEMS.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        {/* Store info */}
        {!collapsed && store && (
          <div className="mb-2 flex items-center gap-2 rounded-lg px-3 py-2">
            <Avatar size="sm">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="truncate text-sm font-medium">{store.name}</span>
          </div>
        )}

        {/* Logout */}
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger render={
              <button
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LogOut className="size-4" />
              </button>
            } />
            <TooltipContent side="right">Cerrar sesión</TooltipContent>
          </Tooltip>
        ) : (
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4 shrink-0" />
            <span>Cerrar sesión</span>
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-16 flex size-6 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm transition-colors hover:text-foreground"
      >
        {collapsed ? <ChevronRight className="size-3" /> : <ChevronLeft className="size-3" />}
      </button>
    </aside>
  )
}
