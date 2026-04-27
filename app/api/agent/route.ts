import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { runAgent } from "@/lib/agent"
import { NextResponse } from "next/server"
import { z } from "zod"

// Vercel Fluid: persistent compute — no serverless timeout
export const runtime = "nodejs"
export const maxDuration = 60

const schema = z.object({
  storeId: z.string(),
  clientPhone: z.string(),
  message: z.string().min(1),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await request.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { storeId, clientPhone, message } = parsed.data

  // Verify caller owns the store
  const member = await prisma.storeMember.findFirst({ where: { userId: user.id, storeId } })
  if (!member) return NextResponse.json({ error: "No autorizado" }, { status: 403 })

  const reply = await runAgent({ storeId, clientPhone, message })
  return NextResponse.json({ reply })
}
