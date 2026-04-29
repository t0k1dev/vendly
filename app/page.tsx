import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
// import { Growth } from "@/components/landing/growth"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { Faq } from "@/components/landing/faq"
import { Cta } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { FloatingWhatsapp } from "@/components/landing/floating-whatsapp"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Features />
      {/* <Growth /> */}
      <Testimonials />
      <Pricing />
      <Faq />
      <Cta />
      <Footer />
      <FloatingWhatsapp />
    </div>
  )
}
