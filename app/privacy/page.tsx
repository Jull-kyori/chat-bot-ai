import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-bg-main text-text-primary px-6 py-12">
      <div className="mx-auto max-w-2xl">
        <Link href="/login" className="inline-block mb-8">
          <BrandLogo />
        </Link>
        <h1 className="font-serif text-3xl font-normal mb-4">Kebijakan Privasi</h1>
        <p className="text-sm leading-relaxed text-text-secondary mb-4">
          VerapritygurlAI menghormati privasi Anda. Informasi akun dan riwayat percakapan
          digunakan semata-mata untuk menyediakan layanan asisten AI yang aman dan
          personal.
        </p>
        <p className="text-sm leading-relaxed text-text-secondary mb-8">
          Halaman ini adalah ringkasan kebijakan privasi untuk aplikasi VerapritygurlAI.
        </p>
        <Link
          href="/login"
          className="text-sm text-accent-blue underline underline-offset-2 hover:text-accent-blue-hover"
        >
          Kembali ke halaman masuk
        </Link>
      </div>
    </div>
  );
}
