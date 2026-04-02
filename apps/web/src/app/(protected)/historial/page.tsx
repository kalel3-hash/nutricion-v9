import AuthGuard from "@/app/AuthGuard";
import HistorialClient from "./HistorialClient";

export default function HistorialPage() {
  return (
    <AuthGuard>
      <HistorialClient />
    </AuthGuard>
  );
}