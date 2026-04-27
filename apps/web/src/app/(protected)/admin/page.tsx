import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabaseService";
import AdminClient from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/login");

  const supabase = createSupabaseAdmin();

  // Verificar si es admin
  const { data: profile } = await supabase
    .from("health_profiles")
    .select("is_admin")
    .eq("owner_email", session.user.email)
    .single();

  if (!profile?.is_admin) redirect("/dashboard");

  // Usuarios de health_profiles
  const { data: profiles } = await supabase
    .from("health_profiles")
    .select("owner_email, full_name, created_at, is_admin, age, sex, weight_kg, height_cm")
    .order("created_at", { ascending: false });

  // Historial de analisis
  const { data: history } = await supabase
    .from("analysis_history")
    .select("owner_email, food_description, score, created_at")
    .order("created_at", { ascending: false });

  // Limites de uso
  const { data: usage } = await supabase
    .from("usage_limits")
    .select("owner_email, daily_count, monthly_count, updated_at")
    .order("monthly_count", { ascending: false });

  return (
    <AdminClient
      profiles={profiles ?? []}
      history={history ?? []}
      usage={usage ?? []}
      currentEmail={session.user.email}
    />
  );
}