export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabaseService";

// GET /api/history -> lista historial del usuario logueado (por email)
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ items: [], reason: "no-auth" }, { status: 200 });
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("analysis_history")
    .select("*")
    .eq("owner_email", email)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ items: data ?? [] }, { status: 200 });
}

// POST /api/history -> inserta un análisis para el usuario logueado (por email)
export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const food_description = body?.food_description ?? "";
  const analysis_result = body?.analysis_result ?? "";
  const score = body?.score ?? null;

  if (!food_description || !analysis_result) {
    return NextResponse.json({ ok: false, error: "Datos incompletos" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase.from("analysis_history").insert({
    owner_email: email,
    food_description,
    analysis_result,
    score,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}