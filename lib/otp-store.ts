import crypto from "crypto";

interface OtpEntry {
  code: string;
  expiresAt: number;
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 menit

const globalForOtp = globalThis as unknown as {
  namabotOtpStore?: Map<string, OtpEntry>;
};

const otpStore =
  globalForOtp.namabotOtpStore ?? new Map<string, OtpEntry>();

if (process.env.NODE_ENV !== "production") {
  globalForOtp.namabotOtpStore = otpStore;
}

/**
 * Menghasilkan kode OTP 6 digit untuk email tertentu dan menyimpannya selama 10 menit.
 */
export function generateOtp(email: string): string {
  const normalized = email.trim().toLowerCase();
  const code = crypto.randomInt(100000, 999999).toString();
  otpStore.set(normalized, {
    code,
    expiresAt: Date.now() + OTP_TTL_MS,
  });
  return code;
}

/**
 * Memverifikasi kode OTP 6 digit dan menghapusnya setelah berhasil dipakai.
 */
export function verifyOtp(email: string, code: string): boolean {
  const normalized = email.trim().toLowerCase();
  const entry = otpStore.get(normalized);
  if (!entry) return false;

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return false;
  }

  if (entry.code !== code.trim()) {
    return false;
  }

  otpStore.delete(normalized);
  return true;
}
