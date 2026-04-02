import AuthGuard from "@/app/AuthGuard";
import PerfilClient from "./PerfilClient";

export default function PerfilPage() {
  return (
    <AuthGuard>
      <PerfilClient />
    </AuthGuard>
  );
}