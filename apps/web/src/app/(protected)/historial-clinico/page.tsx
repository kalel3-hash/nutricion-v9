// apps/web/src/app/(protected)/historial-clinico/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NavbarProtegido from "@/components/NavbarProtegido";
import HistorialClinicoClient from "./HistorialClinicoClient";

export default async function HistorialClinicoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <NavbarProtegido />
      <HistorialClinicoClient />
    </>
  );
}