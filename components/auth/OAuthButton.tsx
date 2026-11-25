"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OAuthButtonProps {
  provider: "google" | "apple";
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

const providerIcons: Record<OAuthButtonProps["provider"], ReactNode> = {
  google: (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  ),
  apple: (
    <svg
      className="h-4 w-4 shrink-0 text-text-primary"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z" />
    </svg>
  ),
};

/**
 * Tombol login OAuth (Google / Apple) bergaya kapsul gelap dengan ikon penyedia.
 */
export function OAuthButton({
  provider,
  label,
  onClick,
  disabled,
  className,
}: OAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-center gap-2.5 rounded-xl bg-bg-elevated px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-elevated-hover active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50",
        className
      )}
    >
      {providerIcons[provider]}
      <span>{label}</span>
    </button>
  );
}
