export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createSupabaseAdmin } from "@/lib/supabaseService";

export async function GET() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ items: [] }, { status: 200 });

  const supabase = createSupabaseAdmin();

  const { data, error } = await supabase
    .from("daily_balance_history")
    .select("id, fecha, created_at, tdee_kcal, calorias_consumidas_kcal, calorias_quemadas_kcal, balance_kcal, analisis_gemini")
    .eq("owner_email", email)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ items: [], error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}
