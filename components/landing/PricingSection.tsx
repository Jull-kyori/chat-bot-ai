"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PLAN_TABS, PLANS_BY_AUDIENCE, PlanAudience } from "@/lib/plans";
import { PlanCard } from "@/components/landing/PlanCard";
import { cn } from "@/lib/utils";

/**
 * Bagian "Jelajahi paket" dengan toggle beranimasi geser (layoutId)
 * dan transisi kartu bertahap.
 */
export function PricingSection() {
  const [audience, setAudience] = useState<PlanAudience>("personal");

  const scrollToLogin = () => {
    const el = document.getElementById("login-card");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const plans = PLANS_BY_AUDIENCE[audience];

  return (
    <section
      id="pricing"
      className="mx-auto w-full max-w-[1200px] px-6 py-16 sm:py-24"
    >
      <div className="flex flex-col items-center text-center">
        <h2 className="font-serif text-3xl font-normal tracking-tight text-text-primary sm:text-4xl">
          Jelajahi paket
        </h2>

        {/* Segmented toggle dengan pill animasi geser */}
        <div
          role="tablist"
          aria-label="Pilih kategori paket"
          className="mt-6 inline-flex items-center rounded-full border border-border-subtle bg-bg-surface p-1"
        >
          {PLAN_TABS.map((tab) => {
            const active = audience === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setAudience(tab.id)}
                className={cn(
                  "relative rounded-full px-5 py-1.5 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50",
                  active
                    ? "text-text-primary"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="pricing-tab-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 rounded-full bg-bg-elevated shadow-sm"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid 3 Kartu Paket */}
      <motion.div
        key={audience}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut" }}
        className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3"
      >
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} onAction={scrollToLogin} />
        ))}
      </motion.div>

      <p className="mt-8 text-center text-xs text-text-secondary">
        *
        <Link
          href="/privacy"
          className="text-accent-blue underline underline-offset-2 hover:text-accent-blue-hover"
        >
          Batasan penggunaan
        </Link>{" "}
        berlaku. Harga belum termasuk pajak. Harga dan paket dapat berubah.
      </p>
    </section>
  );
}
