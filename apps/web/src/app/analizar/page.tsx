import { createServerClient } from "@/lib/supabase";
import AnalizarClient from "./AnalizarClient";

export default async function AnalizarPage() {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ❌ NO redirect acá

  return <AnalizarClient userId={session?.user.id ?? null} />;
}