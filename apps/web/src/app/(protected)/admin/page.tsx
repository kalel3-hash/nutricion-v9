import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminClient from "./AdminClient";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { data: profiles } = await supabaseAdmin
    .from("health_profiles")
    .select("owner_email, full_name, created_at, age, sex, weight_kg, height_cm, fasting_glucose_mg_dl, total_cholesterol_mg_dl")
    .order("created_at", { ascending: false });

  const { data: usage } = await supabaseAdmin
    .from("usage_limits")
    .select("owner_email, daily_count, monthly_count");

  const { data: history } = await supabaseAdmin
    .from("analysis_history")
    .select("owner_email");

  const totalByEmail: Record<string, number> = {};
  (history || []).forEach((row) => {
    totalByEmail[row.owner_email] = (totalByEmail[row.owner_email] || 0) + 1;
  });

  const usageByEmail: Record<string, { daily_count: number; monthly_count: number }> = {};
  (usage || []).forEach((row) => {
    usageByEmail[row.owner_email] = {
      daily_count: row.daily_count,
      monthly_count: row.monthly_count,
    };
  });

  const users = (profiles || []).map((p) => {
    const isComplete = !!(
      p.age &&
      p.sex &&
      p.weight_kg &&
      p.height_cm &&
      (p.fasting_glucose_mg_dl || p.total_cholesterol_mg_dl)
    );
    const u = usageByEmail[p.owner_email] || { daily_count: 0, monthly_count: 0 };
    return {
      email: p.owner_email,
      full_name: p.full_name || "",
      created_at: p.created_at,
      profile_complete: isComplete,
      daily_count: u.daily_count,
      monthly_count: u.monthly_count,
      total_count: totalByEmail[p.owner_email] || 0,
    };
  });

  const summary = {
    total_users: users.length,
    perfiles_completos: users.filter((u) => u.profile_complete).length,
    consultas_hoy: users.reduce((s, u) => s + u.daily_count, 0),
    consultas_mes: users.reduce((s, u) => s + u.monthly_count, 0),
  };

  return <AdminClient users={users} summary={summary} />;
}