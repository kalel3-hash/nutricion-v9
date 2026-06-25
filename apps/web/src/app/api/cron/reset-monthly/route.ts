// apps/web/src/app/api/cron/reset-monthly/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const firstOfMonth = new Date().toISOString().slice(0, 7) + "-01";

  await supabase
    .from("usage_limits")
    .update({ monthly_count: 0, monthly_reset_month: firstOfMonth })
    .gte("id", "00000000-0000-0000-0000-000000000000");

  return NextResponse.json({ ok: true, reset: "monthly" });
}