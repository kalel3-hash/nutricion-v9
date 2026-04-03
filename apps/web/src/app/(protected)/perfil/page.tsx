import { auth } from "@/auth";
import Link from "next/link";
import PerfilFormClient from "./PerfilFormClient";

export default async function PerfilPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold">VitalCross AI</h1>

        <Link href="/dashboard" className="bg-green-800 px-4 py-1 rounded-md text-sm">
          Volver
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-4 mt-4 space-y-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <h1 className="text-xl font-black mb-4">Perfil</h1>

            <div className="flex items-center gap-4">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="Avatar" className="h-12 w-12 rounded-full" />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gray-200" />
              )}

              <div>
                <div className="font-bold">{user?.name ?? "Usuario"}</div>
                <div className="text-sm text-gray-600">{user?.email ?? "Sin email"}</div>
              </div>
            </div>

            <div className="mt-6 text-sm text-gray-700">
              <p className="font-semibold mb-2">Estado</p>
              <p>Sesión OK (NextAuth). Este perfil no depende de Supabase Auth.</p>
            </div>
          </div>
        </div>

        <PerfilFormClient />
      </main>
    </div>
  );
}