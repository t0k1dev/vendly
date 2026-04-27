import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { z } from "zod"

async function getStoreId(userId: string) {
  const member = await prisma.storeMember.findFirst({ where: { userId } })
  return member?.storeId ?? null
}

// GET /api/clients
export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getStoreId(user.id)
  if (!storeId) return NextResponse.json([])

  const clients = await prisma.client.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(clients)
}

const createSchema = z.object({
  phone: z.string().min(1, "Teléfono requerido"),
  name: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
})

// POST /api/clients
export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const storeId = await getStoreId(user.id)
  if (!storeId) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })

  const parsed = createSchema.safeParse(await request.json())
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const client = await prisma.client.upsert({
    where: { storeId_phone: { storeId, phone: parsed.data.phone } },
    create: { storeId, ...parsed.data },
    update: { name: parsed.data.name, location: parsed.data.location, notes: parsed.data.notes },
  })

  return NextResponse.json(client, { status: 201 })
}
