import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NavbarProtegido from "@/components/NavbarProtegido";
import MedicamentosClient from "./MedicamentosClient";

export default async function MedicamentosPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <>
      <NavbarProtegido />
      <MedicamentosClient userEmail={session.user.email!} />
    </>
  );
}