import { auth } from "@/auth";
import dynamic from "next/dynamic";
import PerfilFormClient from "./PerfilFormClient";

const NavbarProtegido = dynamic(() => import("@/components/NavbarProtegido"), { ssr: false });

export default async function PerfilPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>

      <NavbarProtegido />

      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ margin: "0 0 0.3rem", fontSize: "1.5rem", fontWeight: 700, color: "#2C2C2A" }}>
            Perfil de salud
          </h1>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#5F5E5A" }}>
            {user?.email ?? ""}
          </p>
        </div>

        <PerfilFormClient />
      </main>
    </div>
  );
}