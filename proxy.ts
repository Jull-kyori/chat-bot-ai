import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { AUTH_SECRET } from "@/lib/auth";

/**
 * Proxy (pengganti middleware.ts di Next.js 16) untuk melindungi rute /chat
 * dan mengarahkan pengguna yang sudah masuk dari /login ke /chat.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: AUTH_SECRET });

  if (pathname.startsWith("/chat") && !token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/login"],
};
