"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";

export default function RecuperarContrasenaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: `${window.location.origin}/nueva-contrasena` }
    );

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSuccess(true);
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
        <Link href="/" aria-label="Inicio VitalCross AI">
          <Image src="/Logo.png" alt="VitalCross AI" width={240} height={80} className="object-contain mb-2" />
        </Link>

        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 mt-4">
          Recuperar contraseña
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ingresá tu email y te enviamos un link para restablecer tu contraseña
        </p>

        {success ? (
          <div className="mt-8 w-full rounded-2xl bg-green-50 p-6 text-center ring-1 ring-green-200">
            <p className="text-green-800 font-semibold text-lg mb-2">✓ Email enviado</p>
            <p className="text-green-700 text-sm">
              Revisá tu bandeja de entrada y hacé click en el link que te enviamos.
            </p>
            <Link href="/login" className="mt-4 inline-block text-sm font-medium text-green-700 underline">
              Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 w-full space-y-4 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</p>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                id="email" type="email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-60"
            >
              {loading ? "Enviando…" : "Enviar link de recuperación"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium text-green-700 hover:underline">
            Volver al login
          </Link>
        </p>
      </div>
    </main>
  );
}