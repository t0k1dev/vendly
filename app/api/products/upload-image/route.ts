import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Service role client bypasses RLS for storage uploads
const adminStorage = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
).storage

export async function POST(request: Request) {
  // Verify the user is authenticated before allowing upload
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 })

  const ext = file.name.split(".").pop()
  const filename = `${user.id}/${Date.now()}.${ext}`

  const { data, error } = await adminStorage
    .from("product-images")
    .upload(filename, file, { upsert: true })

  if (error) {
    console.error("[upload-image] Supabase storage error:", JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = adminStorage
    .from("product-images")
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
