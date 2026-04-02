import AuthGuard from "@/app/AuthGuard";
import AnalizarClient from "./AnalizarClient";

export default function AnalizarPage() {
  return (
    <AuthGuard>
      <AnalizarClient />
    </AuthGuard>
  );
}
