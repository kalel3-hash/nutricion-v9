import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NavbarProtegido from "@/components/NavbarProtegido";
import HistorialMedicamentosClient from "./HistorialMedicamentosClient";

export default async function HistorialMedicamentosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <NavbarProtegido />
      <HistorialMedicamentosClient />
    </>
  );
}