"use client";

import { useState } from "react";
import { Pause, Play, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { LoginCard } from "@/components/auth/LoginCard";
import { cn } from "@/lib/utils";

const HERO_IMAGE_URL =
  "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=1080&q=80";

/**
 * Bagian Hero halaman /login dengan layout dua kolom, aksen cahaya ambient,
 * kartu masuk, dan pratinjau visual interaktif.
 */
export function Hero() {
  const [isAnimating, setIsAnimating] = useState(true);
  const [imgError, setImgError] = useState(false);

  return (
    <section className="relative overflow-hidden">
      {/* Cahaya ambient halus agar tampilan lebih berdimensi */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-accent-coral/10 blur-[130px]"
      />

      <div className="relative mx-auto w-full max-w-[1280px] px-6 py-10 sm:py-14 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Kolom Kiri: Badge, Headline, Subheadline, Kartu Login, Tombol Desktop */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex flex-col items-center text-center"
          >
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface/80 px-3.5 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-coral" />
              <span>Asisten AI Generasi Baru</span>
            </div>

            <h1 className="font-serif text-4xl font-normal leading-[1.12] tracking-tight text-text-primary sm:text-5xl lg:text-[54px]">
              Jelajahi apa yang
              <br />
              akan datang
            </h1>
            <p className="mt-4 mb-8 font-serif text-lg text-text-secondary sm:text-xl">
              Mitra berpikir untuk ambisi besar Anda
            </p>

            <LoginCard />

            <button
              type="button"
              className="mt-4 inline-flex items-center justify-center gap-2.5 rounded-xl border border-border-subtle bg-bg-elevated/85 px-5 py-2.5 text-sm font-medium text-text-primary transition-all hover:border-border-strong hover:bg-bg-elevated-hover cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50"
            >
              <svg
                className="h-4 w-4 shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
              </svg>
              <span>Unduh aplikasi desktop</span>
            </button>
          </motion.div>

          {/* Kolom Kanan: Gambar Vertikal 4:5 dengan kartu status mengambang & kontrol pause/play */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, ease: "easeOut", delay: 0.08 }}
            className="relative mx-auto w-full max-w-[500px]"
          >
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-border-subtle bg-bg-surface shadow-2xl shadow-black/45">
              {!imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={HERO_IMAGE_URL}
                  alt="Seseorang bekerja di meja kerja yang penuh catatan dan ide"
                  onError={() => setImgError(true)}
                  className={cn(
                    "h-full w-full object-cover transition-transform duration-[8000ms] ease-in-out",
                    isAnimating ? "scale-105" : "scale-100"
                  )}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-bg-surface via-bg-main to-accent-coral/15 p-8 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-border-subtle bg-bg-elevated/60">
                    <Sparkles className="h-6 w-6 text-accent-coral" />
                  </div>
                  <p className="font-serif text-xl text-text-primary">
                    Ruang Ide &amp; Catatan
                  </p>
                  <p className="mt-2 max-w-xs text-sm text-text-secondary">
                    Susun gagasan, riset, dan draf tulisan Anda bersama NamaBot.
                  </p>
                </div>
              )}

              {/* Overlay gradasi halus di bagian bawah */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />

              {/* Kartu pratinjau prompt mengambang di pojok kiri bawah */}
              <div className="absolute right-16 bottom-4 left-4 rounded-2xl border border-white/10 bg-black/55 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2 text-[11px] font-medium text-accent-coral">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>NamaBot Workspace</span>
                </div>
                <p className="mt-1 truncate text-xs text-white/90">
                  &ldquo;Rangkum catatan riset ini menjadi peta jalan produk Q3...&rdquo;
                </p>
              </div>

              {/* Tombol Pause / Play di pojok kanan bawah */}
              <button
                type="button"
                onClick={() => setIsAnimating((prev) => !prev)}
                aria-label={isAnimating ? "Jeda animasi visual" : "Putar animasi visual"}
                title={isAnimating ? "Jeda" : "Putar"}
                className="absolute right-4 bottom-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition-colors hover:bg-black/80 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/60"
              >
                {isAnimating ? (
                  <Pause className="h-3.5 w-3.5" />
                ) : (
                  <Play className="h-3.5 w-3.5 translate-x-[1px]" />
                )}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
