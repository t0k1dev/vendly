import { redirect } from "next/navigation"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import OnboardingWizard from "@/components/onboarding/OnboardingWizard"

export default async function OnboardingPage() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  let member = await prisma.storeMember.findFirst({
    where: { userId: user.id },
  })

  // User authenticated but no DB records yet (e.g. signup Prisma call failed) — create them now
  if (!member) {
    const name = user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Usuario"

    await prisma.$transaction(async (tx) => {
      // Upsert user in case it was partially created
      await tx.user.upsert({
        where: { id: user.id },
        create: { id: user.id, email: user.email!, name },
        update: {},
      })

      const store = await tx.store.create({
        data: { name: `Tienda de ${name}` },
      })

      member = await tx.storeMember.create({
        data: { userId: user.id, storeId: store.id, role: "OWNER" },
      })
    })
  }

  if (!member) redirect("/login")

  const store = await prisma.store.findUnique({
    where: { id: member.storeId },
  })

  if (!store) redirect("/login")

  if (store.onboardingCompleted) redirect("/dashboard")

  return (
    <OnboardingWizard
      storeId={store.id}
      initialStoreName={store.name}
    />
  )
}
