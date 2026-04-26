import { prisma } from "@/lib/prisma"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    const supabase = await createSupabaseServerClient()

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (!data.user) {
      return NextResponse.json({ error: "Signup failed" }, { status: 400 })
    }

    // Create User + Store + StoreMember in a transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          id: data.user!.id,
          email: data.user!.email!,
          name: name ?? null,
        },
      })

      const store = await tx.store.create({
        data: {
          name: `Tienda de ${name ?? email}`,
        },
      })

      await tx.storeMember.create({
        data: {
          userId: user.id,
          storeId: store.id,
          role: "OWNER",
        },
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
