import AuthGuard from "@/app/AuthGuard";
import HistorialClient from "./HistorialClient";
import { createServerClient } from "@/lib/supabase";

export default async function HistorialPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getSession();

  return (
    <AuthGuard>
      <HistorialClient userId={data.session?.user.id ?? ""} />
    </AuthGuard>
  );
}