// apps/web/src/app/(protected)/admin/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabaseService";
import AdminClient from "./AdminClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDateKeyInAR(dateString: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(dateString));
}

function getMonthKeyInAR(dateString: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric", month: "2-digit",
  }).format(new Date(dateString));
}

export default async function AdminPage() {
  const session = await auth();
  const currentEmail = session?.user?.email?.toLowerCase();
  if (!currentEmail) redirect("/login");

  const supabase = createSupabaseAdmin();

  const { data: authUsersData, error: authUsersError } = await supabase.auth.admin.listUsers();
  if (authUsersError) throw new Error(authUsersError.message);

  const authUsers = authUsersData?.users ?? [];

  const { data: roles } = await supabase.from("user_roles").select("user_id, role").eq("role", "admin");
  const adminSet = new Set((roles || []).map((r) => r.user_id));

  const currentAuthUser = authUsers.find((u) => u.email?.toLowerCase() === currentEmail);
  if (!currentAuthUser || !adminSet.has(currentAuthUser.id)) redirect("/dashboard");

  const { data: profileRows } = await supabase
    .from("health_profiles")
    .select("owner_email, full_name, created_at, age, sex, weight_kg, height_cm");

  const profileByEmail: Record<string, any> = {};
  (profileRows || []).forEach((p) => {
    profileByEmail[(p.owner_email || "").toLowerCase()] = p;
  });

  const { data: history } = await supabase
    .from("analysis_history")
    .select("owner_email, food_description, score, created_at")
    .order("created_at", { ascending: false });

  const historyRows = history ?? [];

  const profiles = authUsers.map((u) => {
    const email = (u.email || "").toLowerCase();
    const p = profileByEmail[email];
    const provider = (u.app_metadata as any)?.provider || (u.identities?.[0] as any)?.provider || "email";
    const profileComplete = !!(p?.age && p?.sex && p?.weight_kg && p?.height_cm);
    return {
      owner_id: u.id,
      owner_email: u.email || "",
      full_name: p?.full_name || (u.user_metadata as any)?.full_name || "",
      created_at: p?.created_at || u.created_at,
      is_admin: adminSet.has(u.id),
      provider,
      profile_complete: profileComplete,
      age: p?.age,
      sex: p?.sex,
      weight_kg: p?.weight_kg,
      height_cm: p?.height_cm,
    };
  });

  const now = new Date();
  const todayKey = getDateKeyInAR(now.toISOString());
  const monthKey = getMonthKeyInAR(now.toISOString());

  const lastActivityByEmail: Record<string, string> = {};
  historyRows.forEach((h) => {
    if (!h.owner_email || !h.created_at) return;
    const email = h.owner_email.toLowerCase();
    const current = lastActivityByEmail[email];
    if (!current || new Date(h.created_at).getTime() > new Date(current).getTime()) {
      lastActivityByEmail[email] = h.created_at;
    }
  });

  // Traer usage desde usage_limits (fuente de verdad)
  const { data: usageLimitsRows } = await supabase
    .from("usage_limits")
    .select("owner_email, daily_count, daily_limit, monthly_count, monthly_limit, last_reset_by, last_reset_at, daily_reset_date, monthly_reset_month");

  const today = now.toISOString().slice(0, 10);
  const currentMonth = now.toISOString().slice(0, 7) + "-01";

  const usage = (usageLimitsRows ?? []).map((row) => {
    const dailyCount  = row.daily_reset_date    === today        ? row.daily_count   : 0;
    const monthlyCount = row.monthly_reset_month === currentMonth ? row.monthly_count : 0;
    const lastActivity = lastActivityByEmail[(row.owner_email || "").toLowerCase()];
    return {
      owner_email:    row.owner_email,
      daily_count:   dailyCount,
      daily_limit:   row.daily_limit,
      monthly_count: monthlyCount,
      monthly_limit: row.monthly_limit,
      last_reset_by: row.last_reset_by,
      last_reset_at: row.last_reset_at,
      updated_at:    lastActivity,
    };
  }).sort((a, b) => (b.monthly_count ?? 0) - (a.monthly_count ?? 0));

  const { data: waitlistRows } = await supabase
    .from("waitlist")
    .select("id, email, created_at")
    .order("created_at", { ascending: false });

  return (
    <AdminClient
      profiles={profiles}
      history={historyRows}
      usage={usage}
      currentEmail={currentEmail}
      waitlist={waitlistRows ?? []}
    />
  );
}