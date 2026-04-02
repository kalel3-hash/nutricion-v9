import AuthGuard from "@/app/AuthGuard";
import EvolucionClient from "./EvolucionClient";
import { createServerClient } from "@/lib/supabase";

export default async function EvolucionPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getSession();

  return (
    <AuthGuard>
      <EvolucionClient userId={data.session?.user.id ?? ""} />
    </AuthGuard>
  );
}