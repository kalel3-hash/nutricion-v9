import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * GET
 * Devuelve usuarios con su rol admin (incluye auditoría)
 */
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

  // Traer usuarios + roles + auditoría
  const { data } = await supabase
    .from("health_profiles")
    .select(`
      owner_id,
      owner_email,
      full_name,
      user_roles(
        role,
        granted_by,
        granted_at,
        revoked_at
      )
    `);

  return NextResponse.json({ users: data || [] });
}

/**
 * POST
 * Hace o revoca admin (con auditoría)
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const body = await req.json();
  const { user_id, make_admin } = body;

  // Verificar que quien llama es admin
  const { data: me } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", session.user.id)
    .single();

  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!user_id) {
    return NextResponse.json(
      { error: "Missing user_id" },
      { status: 400 }
    );
  }

  if (make_admin) {
    // Promover a admin (upsert)
    await supabase.from("user_roles").upsert({
      user_id,
      role: "admin",
      granted_by: session.user.id,
      granted_at: new Date().toISOString(),
      revoked_at: null,
    });
  } else {
    // Revocar admin (NO borrar, solo marcar)
    await supabase
      .from("user_roles")
      .update({
        revoked_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);
  }

  return NextResponse.json({ ok: true });
}
