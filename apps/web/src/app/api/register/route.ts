import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  try {
    return NextResponse.json({
      ok: true,
      message: "Register endpoint reached",
    });
  } catch {
    return NextResponse.json(
      { error: "Unreachable" },
      { status: 500 }
    );
  }
}