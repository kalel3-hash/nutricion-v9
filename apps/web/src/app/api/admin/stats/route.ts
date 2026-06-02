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

  // Verificar que el usuario actual es admin
  const { data: myRole } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (myRole?.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // 1) Usuarios reales de Supabase Auth
  const {
    data: authUsersData,
    error: authUsersError,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (authUsersError) {
    return NextResponse.json(
      { error: authUsersError.message },
      { status: 500 }
    );
  }

  const authUsers = authUsersData?.users ?? [];

  // 2) Perfiles
  const { data: profiles } = await supabaseAdmin
    .from("health_profiles")
    .select(
      "owner_email, full_name, created_at, age, sex, weight_kg, height_cm, fasting_glucose_mg_dl, total_cholesterol_mg_dl"
    );

  // 3) Uso
  const { data: usage } = await supabaseAdmin
    .from("usage_limits")
    .select("owner_email, daily_count, monthly_count");

  // 4) Historial
  const { data: history } = await supabaseAdmin
    .from("analysis_history")
    .select("owner_email");

  // 5) Roles admin
  const { data: roles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin");

  const adminSet = new Set((roles || []).map(r => r.user_id));

  const profilesByEmail: Record<string, any> = {};
  (profiles || []).forEach(p => {
    profilesByEmail[p.owner_email] = p;
  });

  const usageByEmail: Record<
    string,
    { daily_count: number; monthly_count: number }
  > = {};
  (usage || []).forEach(u => {
    usageByEmail[u.owner_email] = {
      daily_count: u.daily_count,
      monthly_count: u.monthly_count,
    };
  });

  const totalByEmail: Record<string, number> = {};
  (history || []).forEach(h => {
    totalByEmail[h.owner_email] = (totalByEmail[h.owner_email] || 0) + 1;
  });

  const users = authUsers.map(user => {
    const email = user.email || "";
    const profile = profilesByEmail[email];
    const usageInfo = usageByEmail[email] || {
      daily_count: 0,
      monthly_count: 0,
    };

    const profileComplete = !!(
      profile?.age &&
      profile?.sex &&
      profile?.weight_kg &&
      profile?.height_cm &&
      (profile?.fasting_glucose_mg_dl || profile?.total_cholesterol_mg_dl)
    );

    return {
      user_id: user.id,
      email,
      full_name:
        profile?.full_name ||
        user.user_metadata?.full_name ||
        "",
      created_at: profile?.created_at || user.created_at,
      profile_complete: profileComplete,
      daily_count: usageInfo.daily_count,
      monthly_count: usageInfo.monthly_count,
      total_count: totalByEmail[email] || 0,
      is_admin: adminSet.has(user.id),
    };
  });

  const summary = {
    total_users: users.length,
    perfiles_completos: users.filter(u => u.profile_complete).length,
    consultas_hoy: users.reduce((sum, u) => sum + u.daily_count, 0),
    consultas_mes: users.reduce((sum, u) => sum + u.monthly_count, 0),
  };

  return NextResponse.json({ users, summary });
}