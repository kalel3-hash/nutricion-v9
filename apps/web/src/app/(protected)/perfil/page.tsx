import { auth } from "@/auth";
import PerfilFormClient from "./PerfilFormClient";
import NavbarWrapper from "./NavbarWrapper";

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>;
}) {
  const session = await auth();
  const user = session?.user;
  const params = await searchParams;
  const isOnboarding = params.onboarding === "true";

  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF" }}>
      <NavbarWrapper isOnboarding={isOnboarding} />
      <main style={{ maxWidth: "700px", margin: "0 auto", padding: "2.5rem 1.5rem" }}>

        {isOnboarding && (
          <div style={{
            background: "linear-gradient(135deg, #185FA5 0%, #0C447C 100%)",
            borderRadius: "14px", padding: "1.5rem 1.75rem",
            marginBottom: "1.75rem",
            boxShadow: "0 4px 16px rgba(24,95,165,0.2)",
          }}>
            <p style={{ margin: "0 0 0.3rem", fontSize: "1.1rem", fontWeight: 700, color: "#FFFFFF" }}>
              Bienvenido a VitalCross AI
            </p>
            <p style={{ margin: 0, fontSize: "0.875rem", color: "rgba(255,255,255,0.85)", lineHeight: 1.6 }}>
              Para recibir analisis personalizados necesitas cargar tu perfil de salud primero. Solo lleva unos minutos y podes usar la IA para cargar tus estudios automaticamente.
            </p>
          </div>
        )}

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