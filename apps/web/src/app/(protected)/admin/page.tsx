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

  if (!session?.user?.id) {
    redirect("/login");
  }

  const supabase = createSupabaseAdmin();

  // ✅ Verificar rol admin usando user_roles (FUENTE ÚNICA)
  const { data: myRole } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (myRole?.role !== "admin") {
    redirect("/dashboard");
  }

  // Usuarios / perfiles
  const { data: profiles } = await supabase
    .from("health_profiles")
    .select(
      "owner_id, owner_email, full_name, created_at, age, sex, weight_kg, height_cm"
    )
    .order("created_at", { ascending: false });

  // Historial de análisis
  const { data: history } = await supabase
    .from("analysis_history")
    .select("owner_email, food_description, score, created_at")
    .order("created_at", { ascending: false });

  // Límites de uso
  const { data: usage } = await supabase
    .from("usage_limits")
    .select("owner_email, daily_count, monthly_count, updated_at")
    .order("monthly_count", { ascending: false });

  // Roles admin reales
  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin");

  const adminSet = new Set((roles || []).map((r) => r.user_id));

  const enrichedProfiles =
    (profiles || []).map((p) => ({
      ...p,
      is_admin: adminSet.has(p.owner_id),
    })) ?? [];

  return (
    <AdminClient
      profiles={enrichedProfiles}
      history={history ?? []}
      usage={usage ?? []}
      currentEmail={session.user.email}
    />
  );
}