import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { generateOtp } from "@/lib/otp-store";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase() ?? "";

    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Format email tidak valid." },
        { status: 400 }
      );
    }

    const code = generateOtp(email);

    const smtpUrl = process.env.EMAIL_SERVER || process.env.SMTP_URL;
    const smtpHost = process.env.EMAIL_SERVER_HOST || process.env.SMTP_HOST;
    const smtpUser = process.env.EMAIL_SERVER_USER || process.env.SMTP_USER;
    const smtpPassword = process.env.EMAIL_SERVER_PASSWORD || process.env.SMTP_PASSWORD;
    const hasSmtpUrl = Boolean(smtpUrl);
    const hasSmtpFields = Boolean(smtpHost && smtpUser && smtpPassword);

    if (!hasSmtpUrl && !hasSmtpFields) {
      console.error("OTP tidak dikirim: konfigurasi SMTP belum lengkap.");
      return NextResponse.json(
        { error: "Layanan email belum dikonfigurasi. Hubungi administrator." },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport(
      hasSmtpUrl
        ? smtpUrl!
        : {
            host: smtpHost,
            port: Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT || 587),
            secure: Number(process.env.EMAIL_SERVER_PORT || process.env.SMTP_PORT) === 465,
            auth: { user: smtpUser, pass: smtpPassword },
          }
    );

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_FROM || "VerapritygurlAI <no-reply@example.com>",
        to: email,
        subject: `Kode Masuk VerapritygurlAI Anda: ${code}`,
        text: `Gunakan kode OTP berikut untuk masuk ke VerapritygurlAI: ${code}. Kode berlaku selama 10 menit.`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #121212; color: #ececec; border-radius: 16px;">
            <h2 style="margin: 0 0 12px; color: #d97757;">VerapritygurlAI</h2>
            <p style="margin: 0 0 16px; color: #9a9a9a;">Gunakan kode verifikasi berikut untuk masuk ke akun Anda:</p>
            <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 14px 20px; background: #212121; border-radius: 12px; text-align: center; color: #ffffff;">
              ${code}
            </div>
            <p style="margin: 16px 0 0; font-size: 12px; color: #9a9a9a;">Kode ini berlaku selama 10 menit. Abaikan email ini jika Anda tidak merasa meminta kode masuk.</p>
          </div>
        `,
      });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Gagal mengirim OTP:", err);
    return NextResponse.json(
      { error: "Gagal mengirim kode verifikasi. Silakan coba lagi." },
      { status: 500 }
    );
  }
}
