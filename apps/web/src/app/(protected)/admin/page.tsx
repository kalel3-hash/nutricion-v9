import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createSupabaseAdmin } from "@/lib/supabaseService";
import AdminClient from "./AdminClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getDateKeyInAR(dateString: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
}

function getMonthKeyInAR(dateString: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
  }).format(new Date(dateString));
}

export default async function AdminPage() {
  const session = await auth();

  const currentEmail = session?.user?.email?.toLowerCase();
  if (!currentEmail) {
    redirect("/login");
  }

  const supabase = createSupabaseAdmin();

  const { data: authUsersData, error: authUsersError } =
    await supabase.auth.admin.listUsers();

  if (authUsersError) {
    throw new Error(authUsersError.message);
  }

  const authUsers = authUsersData?.users ?? [];

  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .eq("role", "admin");

  const adminSet = new Set((roles || []).map((r) => r.user_id));

  const currentAuthUser = authUsers.find(
    (u) => u.email?.toLowerCase() === currentEmail
  );

  if (!currentAuthUser || !adminSet.has(currentAuthUser.id)) {
    redirect("/dashboard");
  }

  const { data: profileRows } = await supabase
    .from("health_profiles")
    .select(
      "owner_email, full_name, created_at, age, sex, weight_kg, height_cm"
    );

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

    const provider =
      (u.app_metadata as any)?.provider ||
      (u.identities?.[0] as any)?.provider ||
      "email";

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

  const usageMap: Record<
    string,
    {
      owner_email: string;
      daily_count: number;
      monthly_count: number;
      updated_at?: string;
    }
  > = {};

  authUsers.forEach((u) => {
    const email = (u.email || "").toLowerCase();
    usageMap[email] = {
      owner_email: u.email || "",
      daily_count: 0,
      monthly_count: 0,
      updated_at: undefined,
    };
  });

  historyRows.forEach((h) => {
    if (!h.owner_email || !h.created_at) return;

    const email = h.owner_email.toLowerCase();

    if (!usageMap[email]) {
      usageMap[email] = {
        owner_email: h.owner_email,
        daily_count: 0,
        monthly_count: 0,
        updated_at: undefined,
      };
    }

    const rowDayKey = getDateKeyInAR(h.created_at);
    const rowMonthKey = getMonthKeyInAR(h.created_at);

    if (rowDayKey === todayKey) {
      usageMap[email].daily_count += 1;
    }

    if (rowMonthKey === monthKey) {
      usageMap[email].monthly_count += 1;
    }

    if (
      !usageMap[email].updated_at ||
      new Date(h.created_at).getTime() >
        new Date(usageMap[email].updated_at as string).getTime()
    ) {
      usageMap[email].updated_at = h.created_at;
    }
  });

  const usage = Object.values(usageMap).sort(
    (a, b) => (b.monthly_count || 0) - (a.monthly_count || 0)
  );

  return (
    <AdminClient
      profiles={profiles}
      history={historyRows}
      usage={usage}
      currentEmail={currentEmail}
    />
  );
}
