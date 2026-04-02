import { createServerClient } from "@/lib/supabase";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const supabase = await createServerClient();
  const { data } = await supabase.auth.getSession();

  return <PerfilClient userId={data.session!.user.id} />;
}