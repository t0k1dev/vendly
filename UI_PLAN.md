# UI Improvement Plan — `ui-improve` branch

## Strategy
Keep the existing stack (shadcn + `@base-ui/react` + Tailwind v4) — it's already correct. The problem is **missing structure and polish**, not the wrong library.

---

## Phase 1 — Foundation

### 1a. Dashboard shell layout
- Create `app/(dashboard)/layout.tsx` with a proper sidebar + topbar
- Sidebar: logo, nav links (Dashboard, Productos, Pedidos, Clientes, Agente, Configuración), user/logout at bottom
- Removes the button-row nav hack from every page
- All dashboard pages inherit it automatically

### 1b. Update metadata
- Fix "Create Next App" title/description in `app/layout.tsx`

### 1c. Landing page
- Replace the Next.js boilerplate `/` with a proper Vendly landing page

---

## Phase 2 — Missing shadcn components
Install the components needed for good UX that are currently missing:
- `skeleton` — loading placeholders (replaces blank screens)
- `toast` (sonner) — success/error feedback
- `separator` — visual dividers
- `avatar` — user avatar in sidebar
- `tooltip` — icon button labels
- `table` — proper table component (orders, clients currently use raw `<table>`)

---

## Phase 3 — Page-by-page polish

| Page | What changes |
|---|---|
| `/login`, `/signup` | Better centered layout, logo, tighter card |
| `/onboarding` | Progress stepper visual improvement |
| `/dashboard` | Skeleton loaders, chart bars as real component |
| `/dashboard/products` | Card grid → proper table with image thumbnail |
| `/dashboard/orders` | Replace raw `<table>` with `Table` component, status badge colors |
| `/dashboard/orders/[id]` | Better timeline component, cleaner layout |
| `/dashboard/clients` | Table component, tag pills |
| `/dashboard/clients/[id]` | Profile header with avatar |
| `/dashboard/settings/agent` | Already decent — minor spacing fixes |
| `/dashboard/settings/whatsapp` | Status indicator improvement |
| `/dashboard/agent/playground` | Already good — minor polish |

---

## Phase 4 — Global UX
- **Skeleton loaders** on every data-fetching page (no more blank white screens)
- **Toast notifications** on every save/create/delete action
- **Error states** — inline error messages when fetches fail
- **Empty states** — friendly illustration/message when lists are empty

---

## Status

| Phase | Status |
|---|---|
| Phase 1a — Dashboard shell layout | ⏳ In progress |
| Phase 1b — Update metadata | ⏳ Pending |
| Phase 1c — Landing page | ⏳ Pending |
| Phase 2 — Missing shadcn components | ⏳ Pending |
| Phase 3 — Page-by-page polish | ⏳ Pending |
| Phase 4 — Global UX | ⏳ Pending |
