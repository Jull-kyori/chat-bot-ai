"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { OAuthButton } from "@/components/auth/OAuthButton";

/**
 * Kartu formulir masuk utama pada halaman /login.
 * Mendukung login Google, Apple, dan Email OTP 6 digit via NextAuth.
 */
export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [error, setError] = useState<string | null>(null);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<
    "google" | "apple" | "email" | "otp" | null
  >(null);

  const handleOAuth = async (provider: "google" | "apple") => {
    setError(null);
    setLoadingAction(provider);
    try {
      const res = await signIn(provider, {
        callbackUrl: "/chat",
        redirect: false,
      });
      if (res?.error) {
        setError(
          `Login ${provider === "google" ? "Google" : "Apple"} belum dikonfigurasi di .env.`
        );
        setLoadingAction(null);
      } else if (res?.url) {
        window.location.href = res.url;
      }
    } catch {
      setError("Terjadi kesalahan saat menghubungkan penyedia login.");
      setLoadingAction(null);
    }
  };

  const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDevOtpHint(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Silakan masukkan alamat email Anda.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Format email tidak valid. Contoh: nama@domain.com");
      return;
    }

    setLoadingAction("email");
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        devOtp?: string;
      };

      if (!res.ok || !data.ok) {
        setError(data.error || "Gagal mengirim kode verifikasi.");
        return;
      }

      if (data.devOtp) {
        setDevOtpHint(data.devOtp);
      }
      setStep("otp");
    } catch {
      setError("Gagal terhubung ke server. Silakan coba lagi.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const trimmedOtp = otp.trim();
    if (trimmedOtp.length < 6) {
      setError("Masukkan 6 digit kode OTP yang dikirim ke email Anda.");
      return;
    }

    setLoadingAction("otp");
    try {
      const res = await signIn("email-otp", {
        email: email.trim(),
        otp: trimmedOtp,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setLoadingAction(null);
        return;
      }

      router.push("/chat");
      router.refresh();
    } catch {
      setError("Gagal memverifikasi kode OTP.");
      setLoadingAction(null);
    }
  };

  return (
    <div
      id="login-card"
      className="w-full max-w-[450px] rounded-3xl border border-border-subtle bg-bg-surface p-6 sm:p-7 shadow-xl shadow-black/20"
    >
      <div className="flex flex-col gap-3">
        <OAuthButton
          provider="google"
          label={
            loadingAction === "google"
              ? "Menghubungkan Google..."
              : "Lanjutkan dengan Google"
          }
          disabled={loadingAction !== null}
          onClick={() => handleOAuth("google")}
        />
        <OAuthButton
          provider="apple"
          label={
            loadingAction === "apple"
              ? "Menghubungkan Apple..."
              : "Lanjutkan dengan Apple"
          }
          disabled={loadingAction !== null}
          onClick={() => handleOAuth("apple")}
        />
      </div>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-border-subtle" />
        <span className="text-[11px] font-medium tracking-widest text-text-secondary uppercase">
          ATAU
        </span>
        <div className="h-px flex-1 bg-border-subtle" />
      </div>

      {step === "email" ? (
        <form onSubmit={handleRequestOtp} noValidate className="flex flex-col gap-3">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Masukkan email Anda"
              aria-label="Masukkan email Anda"
              disabled={loadingAction !== null}
              className="w-full rounded-xl border border-border-subtle bg-bg-input px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary transition-colors focus:border-accent-coral focus:outline-none focus:ring-2 focus:ring-accent-coral/30 disabled:opacity-60"
            />
            {error && (
              <p className="mt-1.5 text-left text-xs text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingAction !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-bg-btn-primary px-4 py-3 text-sm font-medium text-text-btn-primary transition-colors hover:bg-bg-btn-primary-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50"
          >
            {loadingAction === "email" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <span>Lanjutkan dengan email</span>
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} noValidate className="flex flex-col gap-3">
          <div className="text-left">
            <p className="text-xs text-text-secondary">
              Kode verifikasi 6 digit dikirim ke{" "}
              <span className="font-medium text-text-primary">{email}</span>
            </p>
            {devOtpHint && (
              <p className="mt-1 rounded-lg border border-accent-coral/30 bg-accent-coral/10 px-2.5 py-1 text-[11px] text-accent-coral">
                Mode dev (tanpa SMTP): gunakan kode{" "}
                <strong className="font-mono tracking-wider">{devOtpHint}</strong>
              </p>
            )}
          </div>

          <div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, ""));
                if (error) setError(null);
              }}
              placeholder="Masukkan 6 digit kode OTP"
              aria-label="Kode OTP"
              disabled={loadingAction !== null}
              className="w-full rounded-xl border border-border-subtle bg-bg-input px-4 py-3 text-center font-mono text-base tracking-[0.35em] text-text-primary placeholder:font-sans placeholder:text-sm placeholder:tracking-normal placeholder:text-text-secondary transition-colors focus:border-accent-coral focus:outline-none focus:ring-2 focus:ring-accent-coral/30 disabled:opacity-60"
            />
            {error && (
              <p className="mt-1.5 text-left text-xs text-red-400" role="alert">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loadingAction !== null}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-bg-btn-primary px-4 py-3 text-sm font-medium text-text-btn-primary transition-colors hover:bg-bg-btn-primary-hover active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-coral/50"
          >
            {loadingAction === "otp" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <span>Verifikasi &amp; Masuk</span>
          </button>

          <div className="flex items-center justify-between text-xs text-text-secondary">
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setError(null);
                setDevOtpHint(null);
              }}
              className="hover:text-text-primary cursor-pointer"
            >
              Ganti email
            </button>
            <button
              type="button"
              onClick={() => {
                setOtp("");
                setError(null);
                void handleRequestOtp({
                  preventDefault: () => {},
                } as FormEvent<HTMLFormElement>);
              }}
              className="text-accent-blue hover:text-accent-blue-hover cursor-pointer"
            >
              Kirim ulang kode
            </button>
          </div>
        </form>
      )}

      <p className="mt-4 text-center text-xs leading-relaxed text-text-secondary">
        Dengan melanjutkan, Anda menyatakan telah mengetahui{" "}
        <Link
          href="/privacy"
          className="text-accent-blue underline underline-offset-2 hover:text-accent-blue-hover"
        >
          Kebijakan Privasi
        </Link>{" "}
        NamaBot.
      </p>
    </div>
  );
}
