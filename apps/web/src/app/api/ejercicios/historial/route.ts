import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { auth } from "@/auth";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("exercise_plans")
    .select("*")
    .eq("owner_email", session.user.email)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return NextResponse.json({ plan: null });
  }

  return NextResponse.json({ plan: data });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json();
  const { objetivo, dias, equipamiento, nivel, restricciones, plan_content } = body;

  const { error } = await supabase.from("exercise_plans").insert({
    owner_email: session.user.email,
    objetivo,
    dias_por_semana: dias,
    equipamiento,
    nivel,
    plan_content,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}