import { createServerClient } from "@/lib/supabase";
import AnalizarClient from "./AnalizarClient";

export default async function AnalizarPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getSession();

  return <AnalizarClient userId={data.session!.user.id} />;
}