import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabaseService";
import AdminClient from "./AdminClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const supabase = createSupabaseAdmin();

  // 1) Usuarios reales de Supabase Auth
  const {
    data: authUsersData,
    error: authUsersError,
  } = await supabase.auth.admin.listUsers();

  if (authUsersError) {
    throw new Error(authUsersError.message);
  }

  const authUsers = authUsersData?.users ?? [];

  // 2) Roles admin reales
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin");

  const adminSet = new Set((roles || []).map((r) => r.user_id));

  // 3) Validar que el usuario actual sea admin
  const currentAuthUser = authUsers.find(
    (u) => u.email?.toLowerCase() === session.user.email?.toLowerCase()
  );

  if (!currentAuthUser || !adminSet.has(currentAuthUser.id)) {
    redirect("/dashboard");
  }

  // 4) Perfiles
  const { data: profileRows } = await supabase
    .from("health_profiles")
    .select(
      "owner_id, owner_email, full_name, created_at, age, sex, weight_kg, height_cm"
    );

  const profileByEmail: Record<string, any> = {};
  (profileRows || []).forEach((p) => {
    profileByEmail[(p.owner_email || "").toLowerCase()] = p;
  });

  // 5) Historial
  const { data: history } = await supabase
    .from("analysis_history")
    .select("owner_email, food_description, score, created_at")
    .order("created_at", { ascending: false });

  // 6) Uso
  const { data: usage } = await supabase
    .from("usage_limits")
    .select("owner_email, daily_count, monthly_count, updated_at")
    .order("monthly_count", { ascending: false });

  // 7) Armar profiles enriquecidos a partir de Auth + health_profiles + user_roles
  const profiles = authUsers.map((u) => {
    const email = (u.email || "").toLowerCase();
    const p = profileByEmail[email];

    return {
      owner_id: u.id,
      owner_email: u.email || "",
      full_name: p?.full_name || u.user_metadata?.full_name || "",
      created_at: p?.created_at || u.created_at,
      is_admin: adminSet.has(u.id),
      age: p?.age,
      sex: p?.sex,
      weight_kg: p?.weight_kg,
      height_cm: p?.height_cm,
    };
  });

  return (
    <AdminClient
      profiles={profiles}
      history={history ?? []}
      usage={usage ?? []}
      currentEmail={session.user.email}
    />
  );
}