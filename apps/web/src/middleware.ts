import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export default auth(async (req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/analizar") ||
    pathname.startsWith("/historial") ||
    pathname.startsWith("/evolucion") ||
    pathname.startsWith("/admin");

  const isPerfil = pathname.startsWith("/perfil");

  // Sin sesión → login
  if (!session && (isProtected || isPerfil)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Con sesión en ruta protegida → chequear perfil
  if (session?.user?.email && isProtected) {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: profile } = await supabase
      .from("health_profiles")
      .select("owner_email")
      .eq("owner_email", session.user.email)
      .single();

    if (!profile) {
      return NextResponse.redirect(new URL("/perfil?onboarding=true", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|Logo.png|manifest.json|sw.js).*)"],
};