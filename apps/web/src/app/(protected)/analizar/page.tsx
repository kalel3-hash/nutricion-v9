import AuthGuard from "@/app/AuthGuard";
import AnalizarClient from "./AnalizarClient";
import { createServerClient } from "@/lib/supabase";

export default async function AnalizarPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getSession();

  return (
    <AuthGuard>
      <AnalizarClient userId={data.session?.user.id ?? ""} />
    </AuthGuard>
  );
}