import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ✅ Si NO hay sesión, redirigimos (email/password y Google ya resueltos)
  if (!session) {
    redirect("/login");
  }

  // ✅ A esta línea solo llega con session válida
  return <PerfilClient userId={session.user.id} />;
}
