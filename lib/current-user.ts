import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Mengambil atau membuat record User di database Prisma berdasarkan sesi NextAuth aktif.
 */
export async function getCurrentDbUser() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.trim().toLowerCase();

  if (!email) {
    return null;
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name: session?.user?.name ?? undefined,
      image: session?.user?.image ?? undefined,
    },
    create: {
      email,
      name: session?.user?.name || email.split("@")[0] || "Pengguna",
      image: session?.user?.image ?? null,
    },
  });

  return user;
}

