import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { PricingSection } from "@/components/landing/PricingSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { Footer } from "@/components/landing/Footer";

/**
 * Halaman Login & Landing utama NamaBot (/login).
 * Urutan: Header, Hero, Paket, FAQ, Footer.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-bg-main text-text-primary">
      <Header />
      <main className="flex-1">
        <Hero />
        <PricingSection />
        <FaqSection />
      </main>
      <Footer />
    </div>
  );
}
