"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

/**
 * Header halaman landing /login dengan logo di kiri dan tombol aksi di kanan.
 */
export function Header() {
  const scrollToLogin = () => {
    const el = document.getElementById("login-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-bg-main/85 backdrop-blur-md border-b border-border-subtle/50">
      <div className="mx-auto flex h-[60px] max-w-[1440px] items-center justify-between px-6 md:px-[45px]">
        <Link
          href="/login"
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50 rounded-lg"
        >
          <BrandLogo />
        </Link>

        <div className="flex items-center gap-2.5">
          <a
            href="#pricing"
            className="hidden sm:inline-flex items-center justify-center rounded-lg bg-bg-elevated px-3.5 py-1.5 text-xs font-medium text-text-primary transition-colors hover:bg-bg-elevated-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50"
          >
            Hubungi bagian penjualan
          </a>
          <button
            type="button"
            onClick={scrollToLogin}
            className="inline-flex items-center justify-center rounded-lg bg-bg-btn-primary px-3.5 py-1.5 text-xs font-medium text-text-btn-primary transition-colors hover:bg-bg-btn-primary-hover cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50"
          >
            Coba NamaBot
          </button>
        </div>
      </div>
    </header>
  );
}
