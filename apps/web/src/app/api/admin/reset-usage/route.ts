// apps/web/src/app/api/admin/reset-usage/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { email, type } = await req.json() as {
    email: string;
    type: "daily" | "monthly" | "both";
  };

  const updates: Record<string, unknown> = {
    last_reset_by: session.user.email,
    last_reset_at: new Date().toISOString(),
  };

  if (type === "daily" || type === "both") {
    updates.daily_count = 0;
    updates.daily_reset_date = new Date().toISOString().slice(0, 10);
  }

  if (type === "monthly" || type === "both") {
    updates.monthly_count = 0;
    updates.monthly_reset_month = new Date().toISOString().slice(0, 7) + "-01";
  }

  await supabase
    .from("usage_limits")
    .update(updates)
    .eq("owner_email", email);

  return NextResponse.json({ ok: true });
}