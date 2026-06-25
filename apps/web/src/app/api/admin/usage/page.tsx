// apps/web/src/app/admin/usage/page.tsx

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminUsageClient from "./AdminUsageClient";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function AdminUsagePage() {
  const session = await auth();

  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    redirect("/dashboard");
  }

  const { data } = await supabase
    .from("usage_limits")
    .select("owner_email, daily_count, daily_limit, monthly_count, monthly_limit, last_reset_by, last_reset_at")
    .order("monthly_count", { ascending: false });

  return <AdminUsageClient users={data ?? []} />;
}