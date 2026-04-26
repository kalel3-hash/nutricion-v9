import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient();

  // ✅ Verificar rol admin usando user_roles (FUENTE ÚNICA)
  const { data: myRole } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (myRole?.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // ✅ Traer perfiles (INCLUIR owner_id)
  const { data: profiles } = await supabaseAdmin
    .from("health_profiles")
    .select(
      "owner_id, owner_email, full_name, created_at, age, sex, weight_kg, height_cm, fasting_glucose_mg_dl, total_cholesterol_mg_dl"
    )
    .order("created_at", { ascending: false });

  const { data: usage } = await supabaseAdmin
    .from("usage_limits")
    .select("owner_email, daily_count, monthly_count");

  const { data: history } = await supabaseAdmin
    .from("analysis_history")
    .select("owner_email");

  // ✅ Traer roles admin
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin");

  const adminSet = new Set((roles || []).map(r => r.user_id));

  const totalByEmail: Record<string, number> = {};
  (history || []).forEach(row => {
    totalByEmail[row.owner_email] =
      (totalByEmail[row.owner_email] || 0) + 1;
  });

  const usageByEmail: Record<
    string,
    { daily_count: number; monthly_count: number }
  > = {};
  (usage || []).forEach(row => {
    usageByEmail[row.owner_email] = {
      daily_count: row.daily_count,
      monthly_count: row.monthly_count,
    };
  });

  const users = (profiles || []).map(p => {
    const isComplete = !!(
      p.age &&
      p.sex &&
      p.weight_kg &&
      p.height_cm &&
      (p.fasting_glucose_mg_dl ||
        p.total_cholesterol_mg_dl)
    );

    const u = usageByEmail[p.owner_email] || {
      daily_count: 0,
      monthly_count: 0,
    };

    return {
      user_id: p.owner_id,                 // ✅ CLAVE
      email: p.owner_email,
      full_name: p.full_name || "",
      created_at: p.created_at,
      profile_complete: isComplete,
      daily_count: u.daily_count,
      monthly_count: u.monthly_count,
      total_count: totalByEmail[p.owner_email] || 0,
      is_admin: adminSet.has(p.owner_id),  // ✅ CLAVE
    };
  });

  const summary = {
    total_users: users.length,
    perfiles_completos: users.filter(
      u => u.profile_complete
    ).length,
    consultas_hoy: users.reduce(
      (s, u) => s + u.daily_count,
      0
    ),
    consultas_mes: users.reduce(
      (s, u) => s + u.monthly_count,
      0
    ),
  };

  return NextResponse.json({ users, summary });
}