import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json([], { status: 200 });
  }

  const ids = idsParam.split(",").map(Number).filter(Boolean);

  if (ids.length === 0) {
    return NextResponse.json([], { status: 200 });
  }

  const { data, error } = await supabase
    .from("exercise_catalog")
    .select("*")
    .in("id", ids);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}