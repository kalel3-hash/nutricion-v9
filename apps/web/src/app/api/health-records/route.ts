// apps/web/src/app/api/health-records/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabaseService";

// GET /api/health-records -> devuelve todos los registros del usuario ordenados por fecha descendente
export async function GET() {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ records: [], reason: "no-auth" }, { status: 200 });
  }

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("health_records")
    .select("*")
    .eq("owner_email", email)
    .order("recorded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ records: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ records: data ?? [] }, { status: 200 });
}

// POST /api/health-records -> guarda un nuevo registro clínico con fecha
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

  if (!body.recorded_at) {
    return NextResponse.json({ ok: false, error: "La fecha del análisis es obligatoria" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  const payload = {
    owner_email: email,
    recorded_at: body.recorded_at,
    weight_kg: body.weight_kg ?? null,
    total_cholesterol_mg_dl: body.total_cholesterol_mg_dl ?? null,
    hdl_mg_dl: body.hdl_mg_dl ?? null,
    ldl_mg_dl: body.ldl_mg_dl ?? null,
    triglycerides_mg_dl: body.triglycerides_mg_dl ?? null,
    fasting_glucose_mg_dl: body.fasting_glucose_mg_dl ?? null,
    hba1c_percent: body.hba1c_percent ?? null,
    creatinine_mg_dl: body.creatinine_mg_dl ?? null,
    urea_mg_dl: body.urea_mg_dl ?? null,
    tsh_miu_l: body.tsh_miu_l ?? null,
    notes: body.notes ?? null,
  };

  const { data, error } = await supabase
    .from("health_records")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, record: data ?? null }, { status: 200 });
}

// DELETE /api/health-records?id=... -> elimina un registro por id (solo si pertenece al usuario)
export async function DELETE(request: Request) {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return NextResponse.json({ ok: false, error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ ok: false, error: "Falta el id del registro" }, { status: 400 });
  }

  const supabase = createSupabaseAdmin();

  const { error } = await supabase
    .from("health_records")
    .delete()
    .eq("id", id)
    .eq("owner_email", email); // seguridad: solo borra registros propios

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}