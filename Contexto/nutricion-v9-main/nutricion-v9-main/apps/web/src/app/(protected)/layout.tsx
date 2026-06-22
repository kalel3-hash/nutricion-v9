import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FooterProtegido from "@/components/FooterProtegido";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div style={{ flex: 1 }}>{children}</div>
      <FooterProtegido />
    </div>
  );
}