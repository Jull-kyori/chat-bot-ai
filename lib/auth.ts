import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyOtp } from "@/lib/otp-store";

export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET || "verapritygurlai-dev-secret-change-in-production";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.APPLE_ID && process.env.APPLE_SECRET) {
  providers.push(
    AppleProvider({
      clientId: process.env.APPLE_ID,
      clientSecret: process.env.APPLE_SECRET,
    })
  );
}

providers.push(
  CredentialsProvider({
    id: "email-otp",
    name: "Email OTP",
    credentials: {
      email: { label: "Email", type: "email" },
      otp: { label: "Kode OTP", type: "text" },
    },
    async authorize(credentials) {
      const email = credentials?.email?.trim().toLowerCase();
      const otp = credentials?.otp?.trim();

      if (!email || !otp) {
        throw new Error("Email dan kode OTP wajib diisi.");
      }

      const valid = verifyOtp(email, otp);
      if (!valid) {
        throw new Error("Kode OTP tidak valid atau sudah kedaluwarsa.");
      }

      const displayName = email.split("@")[0] || "Pengguna";
      return {
        id: email,
        email,
        name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      };
    },
  })
);

export const authOptions: NextAuthOptions = {
  secret: AUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = (token.name as string) || session.user.name;
        session.user.email = (token.email as string) || session.user.email;
      }
      return session;
    },
  },
};
