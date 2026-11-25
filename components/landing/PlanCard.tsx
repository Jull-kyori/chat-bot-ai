"use client";

import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { PlanTier } from "@/lib/plans";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  plan: PlanTier;
  onAction?: () => void;
}

function PlantIllustration({ level }: { level: 1 | 2 | 3 }) {
  if (level === 1) {
    return (
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        className="text-text-secondary"
        aria-hidden="true"
      >
        <path
          d="M22 36V18M22 25C17 25 14 21.5 14 17C18.5 17 22 20 22 25ZM22 21C27 21 30 17.5 30 13C25.5 13 22 16 22 21Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15 36H29"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (level === 2) {
    return (
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        fill="none"
        className="text-text-primary"
        aria-hidden="true"
      >
        <path
          d="M22 37V11M22 29C16 29 12.5 25 12.5 19.5C18 19.5 22 23.5 22 29ZM22 24C28 24 31.5 20 31.5 14.5C26 14.5 22 18.5 22 24ZM22 17C17.5 17 15 14 15 10C19 10 22 13 22 17Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 37H31"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 44 44"
      fill="none"
      className="text-accent-coral"
      aria-hidden="true"
    >
      <path
        d="M22 38V9M22 31C14.5 31 10 26.5 10 20C16.5 20 22 24.5 22 31ZM22 26C29.5 26 34 21.5 34 15C27.5 15 22 19.5 22 26ZM22 19C16.5 19 13 15.5 13 10.5C18.5 10.5 22 14 22 19ZM22 14C26.5 14 29.5 11.5 29.5 7.5C25 7.5 22 10 22 14Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="22" cy="7.5" r="1.5" fill="currentColor" />
      <path
        d="M11 38H33"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Kartu paket langganan dengan ilustrasi botani, harga, CTA, dan daftar fitur.
 */
export function PlanCard({ plan, onAction }: PlanCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 320, damping: 26 }}
      className={cn(
        "relative flex flex-col rounded-3xl border bg-bg-card-dark p-7 sm:p-8 transition-colors duration-200",
        plan.highlighted
          ? "border-accent-coral/45 shadow-[0_0_45px_-14px_rgba(217,119,87,0.28)]"
          : "border-border-subtle hover:border-border-strong"
      )}
    >
      <div className="mb-5 flex items-center justify-between">
        <PlantIllustration level={plan.illustrationLevel} />
        {plan.highlighted && (
          <span className="rounded-full border border-accent-coral/35 bg-accent-coral/10 px-2.5 py-0.5 text-[11px] font-medium text-accent-coral">
            Paling Populer
          </span>
        )}
      </div>

      <h3 className="font-serif text-2xl font-normal tracking-tight text-text-primary">
        {plan.name}
      </h3>
      <p className="mt-1.5 min-h-[40px] text-sm leading-relaxed text-text-secondary">
        {plan.tagline}
      </p>

      <div className="mt-5">
        <div className="text-3xl font-bold tracking-tight text-text-primary">
          {plan.price}
        </div>
        <p className="mt-1 text-xs text-text-secondary">{plan.priceNote}</p>
      </div>

      <button
        type="button"
        onClick={onAction}
        className={cn(
          "mt-6 w-full rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50",
          plan.highlighted
            ? "bg-bg-btn-primary text-text-btn-primary hover:bg-bg-btn-primary-hover"
            : "border border-border-subtle bg-bg-elevated text-text-primary hover:bg-bg-elevated-hover"
        )}
      >
        {plan.ctaLabel}
      </button>

      <p className="mt-2.5 text-center text-[11px] text-text-muted">
        {plan.footnote}
      </p>

      <div className="my-6 h-px w-full bg-border-subtle" />

      <div className="flex-1">
        {plan.featuresTitle && (
          <p className="mb-3 text-xs font-medium text-text-primary">
            {plan.featuresTitle}
          </p>
        )}
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-2.5 text-sm text-text-secondary"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
