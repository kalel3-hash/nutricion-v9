import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  // ✅ Rutas públicas
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/api")
  ) {
    return NextResponse.next();
  }

  // ✅ Rutas protegidas por login
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/perfil") ||
    pathname.startsWith("/analizar") ||
    pathname.startsWith("/historial") ||
    pathname.startsWith("/evolucion")
  ) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  // ✅ ADMIN: dejar pasar SIEMPRE
  // (el control de rol ya lo hacés en el backend)
  if (pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/perfil/:path*",
    "/analizar/:path*",
    "/historial/:path*",
    "/evolucion/:path*",
  ],
};