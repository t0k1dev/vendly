import { createSupabaseServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next({ request })

  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isDashboardRoute = pathname.startsWith("/dashboard")
  const isOnboardingRoute = pathname === "/onboarding"

  // Unauthenticated → redirect to login
  if (!user && (isDashboardRoute || isOnboardingRoute)) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Authenticated → check onboarding status
  if (user && (isDashboardRoute || isOnboardingRoute)) {
    const { data: storeMember } = await supabase
      .from("StoreMember")
      .select("store:Store(onboardingCompleted)")
      .eq("userId", user.id)
      .single()

    const onboardingCompleted =
      (storeMember?.store as unknown as { onboardingCompleted: boolean } | null)
        ?.onboardingCompleted ?? false

    if (!onboardingCompleted && isDashboardRoute) {
      return NextResponse.redirect(new URL("/onboarding", request.url))
    }

    if (onboardingCompleted && isOnboardingRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Authenticated user visiting login/signup → redirect to dashboard
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding", "/login", "/signup"],
}
