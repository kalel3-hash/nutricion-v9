import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const supabase = await createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return <PerfilClient userId={session.user.id} />;
}