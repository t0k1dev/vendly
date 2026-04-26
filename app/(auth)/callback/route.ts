// TODO(post-mvp): Google OAuth callback
// This route handles the OAuth code exchange after Google sign-in.
// Uncomment when Google OAuth is re-enabled.

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { origin } = new URL(request.url)

  // TODO(post-mvp): re-enable when Google OAuth is added back
  // const { searchParams } = new URL(request.url)
  // const code = searchParams.get("code")
  //
  // if (code) {
  //   const supabase = await createSupabaseServerClient()
  //   const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  //
  //   if (!error && data.user) {
  //     const { prisma } = await import("@/lib/prisma")
  //
  //     const existingUser = await prisma.user.findUnique({ where: { id: data.user.id } })
  //
  //     if (!existingUser) {
  //       const name =
  //         data.user.user_metadata?.full_name ??
  //         data.user.email?.split("@")[0] ??
  //         "Usuario"
  //
  //       await prisma.$transaction(async (tx) => {
  //         const user = await tx.user.create({
  //           data: { id: data.user.id, email: data.user.email!, name, avatarUrl: data.user.user_metadata?.avatar_url ?? null },
  //         })
  //         const store = await tx.store.create({ data: { name: `Tienda de ${name}` } })
  //         await tx.storeMember.create({ data: { userId: user.id, storeId: store.id, role: "OWNER" } })
  //       })
  //     }
  //
  //     return NextResponse.redirect(`${origin}/dashboard`)
  //   }
  // }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
