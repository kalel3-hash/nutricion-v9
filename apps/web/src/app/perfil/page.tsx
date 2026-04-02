import { createServerClient } from "@/lib/supabase";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // ❌ NO redirect acá (rompe Google OAuth)
  // Dejamos que el client termine de manejar la sesión

  return <PerfilClient userId={session?.user.id ?? null} />;
}