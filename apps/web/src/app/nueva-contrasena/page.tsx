"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
        <Link href="/" aria-label="Inicio VitalCross AI">
          <Image src="/Logo.png" alt="VitalCross AI" width={240} height={80} className="object-contain mb-2" />
        </Link>

        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 mt-4">
          Nueva contraseña
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresá tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</p>
          )}
          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
            <input
              id="password" type="password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
            <input
              id="confirm" type="password" required
              value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Repetí la contraseña"
            />
          </div>
          <button
            type="submit" disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Guardar nueva contraseña"}
          </button>
        </form>
      </div>
    </main>
  );
}