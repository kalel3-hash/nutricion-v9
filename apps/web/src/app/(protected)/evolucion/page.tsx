import AuthGuard from "@/app/AuthGuard";
import EvolucionClient from "./EvolucionClient";

export default function EvolucionPage() {
  return (
    <AuthGuard>
      <EvolucionClient />
    </AuthGuard>
  );
}