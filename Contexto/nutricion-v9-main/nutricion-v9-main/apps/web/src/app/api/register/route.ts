import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son obligatorios." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName ?? null,
      },
    });

    if (error) {
      console.error("[REGISTER_ERROR]", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data?.user?.id) {
      return NextResponse.json(
        { error: "User not created" },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: data.user });
  } catch (err) {
    console.error("[REGISTER_FATAL]", err);
    return NextResponse.json(
      { error: "Error interno al crear el usuario." },
      { status: 500 }
    );
  }
}