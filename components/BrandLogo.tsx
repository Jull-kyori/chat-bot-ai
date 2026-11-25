"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BrandLogoProps {
  showText?: boolean;
  iconSize?: number;
  animated?: boolean;
  className?: string;
  textClassName?: string;
}

/**
 * Logo khas NamaBot: emblem bintang-kelopak geometris oranye-coral + tipografi serif.
 * Mendukung animasi rotasi halus saat AI sedang memproses/streaming.
 */
export function BrandLogo({
  showText = true,
  iconSize = 26,
  animated = false,
  className,
  textClassName,
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <motion.svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-accent-coral shrink-0"
        aria-hidden="true"
        animate={
          animated
            ? { rotate: 360, scale: [1, 1.08, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={
          animated
            ? {
                rotate: { repeat: Infinity, duration: 3.2, ease: "linear" },
                scale: { repeat: Infinity, duration: 1.4, ease: "easeInOut" },
              }
            : { duration: 0.3 }
        }
      >
        <path
          d="M14 2.5V9.5M14 18.5V25.5M4.04 8.25L10.1 11.75M17.9 16.25L23.96 19.75M23.96 8.25L17.9 11.75M10.1 16.25L4.04 19.75"
          stroke="currentColor"
          strokeWidth="2.3"
          strokeLinecap="round"
        />
        <circle cx="14" cy="14" r="2.3" fill="currentColor" />
      </motion.svg>
      {showText && (
        <span
          className={cn(
            "font-serif text-xl font-medium tracking-tight text-text-primary",
            textClassName
          )}
        >
          NamaBot
        </span>
      )}
    </span>
  );
}
