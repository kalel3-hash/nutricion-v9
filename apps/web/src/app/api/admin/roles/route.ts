import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Verificar que el usuario actual es admin
  const { data: me } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Traer usuarios + roles
  const { data } = await supabase
    .from("health_profiles")
    .select(`
      owner_email,
      full_name,
      user_roles(role)
    `);

  return NextResponse.json({ users: data || [] });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { user_id, make_admin } = body;

  // Chequear admin actual
  const { data: me } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (make_admin) {
    await supabase.from("user_roles").upsert({
      user_id,
      role: "admin",
    });
  } else {
    await supabase.from("user_roles").delete().eq("user_id", user_id);
  }

  return NextResponse.json({ ok: true });
}