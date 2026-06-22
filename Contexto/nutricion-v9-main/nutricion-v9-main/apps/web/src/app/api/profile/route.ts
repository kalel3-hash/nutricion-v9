export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabaseService";

// GET /api/profile -> devuelve el perfil por email
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ profile: null, reason: "no-auth" }, { status: 200 });
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("health_profiles")
    .select("*")
    .eq("owner_email", email)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ profile: null, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data ?? null }, { status: 200 });
}

// POST /api/profile -> crea/actualiza el perfil por email (upsert)
export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ ok: false, error: "Body inválido" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  // Guardamos todo lo que venga + owner_email
  const payload = { owner_email: email, ...body };

  const { data, error } = await supabase
    .from("health_profiles")
    .upsert(payload, { onConflict: "owner_email" })
    .select("*")
    .maybeSingle();

  if (error) {
    // Esto es CLAVE: ahora vas a ver el error real (NOT NULL, columnas, etc.)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, profile: data ?? null }, { status: 200 });
}