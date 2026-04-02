import AuthGuard from "@/app/AuthGuard";
import PerfilClient from "./PerfilClient";
import { createServerClient } from "@/lib/supabase";

export default async function PerfilPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getSession();

  return (
    <AuthGuard>
      <PerfilClient userId={data.session?.user.id ?? ""} />
    </AuthGuard>
  );
}