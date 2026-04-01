"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (signInError) {
      setError("Email o contraseña incorrectos");
      return;
    }

    router.push("/dashboard");
  }

  async function handleGoogleOAuth() {
    setError(null);
    setOauthLoading(true);
    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/dashboard`;

      const { error: signInOAuthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (signInOAuthError) {
        setError(signInOAuthError.message);
      }
    } finally {
      setOauthLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">

        <Link href="/" aria-label="Inicio VitalCross AI">
          <Image
            src="/Logo.png"
            alt="VitalCross AI"
            width={500}
            height={220}
            className="object-contain mb-2"
          />
        </Link>

        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          VitalCross AI — ingresá a tu cuenta
        </p>

        <button
          type="button"
          onClick={handleGoogleOAuth}
          disabled={oauthLoading || loading}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-gray-300 bg-white px-6 py-4 text-base font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true" className="h-5 w-5">
            <path d="M10 1.8 A8.2 8.2 0 0 1 17.9 10" fill="none" stroke="#4285F4" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M17.9 10 A8.2 8.2 0 0 1 10 18.2" fill="none" stroke="#34A853" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M10 18.2 A8.2 8.2 0 0 1 2.1 10" fill="none" stroke="#EA4335" strokeWidth="2.2" strokeLinecap="round"/>
            <path d="M2.1 10 A8.2 8.2 0 0 1 10 1.8" fill="none" stroke="#FBBC05" strokeWidth="2.2" strokeLinecap="round"/>
            <circle cx="10" cy="10" r="5.3" fill="white"/>
          </svg>
          {oauthLoading ? "Redirigiendo…" : "Continuar con Google"}
        </button>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm font-medium text-gray-400">o</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-4 w-full space-y-4 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-gray-100 sm:p-8"
        >
          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="space-y-1.5 text-left">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email" name="email" type="email" autoComplete="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              id="password" name="password" type="password" autoComplete="current-password" required
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
  <Link href="/recuperar-contrasena" className="font-medium text-green-700 hover:underline">
    ¿Olvidaste tu contraseña?
  </Link>
</p>
        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="font-medium text-green-700 underline-offset-2 hover:text-green-800 hover:underline">
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}