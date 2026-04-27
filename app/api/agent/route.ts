import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { runAgent } from "@/lib/agent"
import { NextResponse } from "next/server"
import { z } from "zod"

// Vercel Fluid: persistent compute — no serverless timeout
export const runtime = "nodejs"
export const maxDuration = 60

const schema = z.object({
  // storeId is optional — if omitted (playground), resolved from session
  storeId: z.string().optional(),
  clientPhone: z.string(),
  message: z.string().min(1),
  playground: z.boolean().optional(),
  history: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() }))
    .optional(),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { clientPhone, message, playground, history } = parsed.data

  // Resolve storeId — from body or from session
  let storeId = parsed.data.storeId
  if (!storeId) {
    const member = await prisma.storeMember.findFirst({ where: { userId: user.id } })
    if (!member) return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    storeId = member.storeId
  } else {
    // Verify caller owns the provided store
    const member = await prisma.storeMember.findFirst({ where: { userId: user.id, storeId } })
    if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const turn = await runAgent({ storeId, clientPhone, message, playground, history })
  return NextResponse.json(turn)
}
