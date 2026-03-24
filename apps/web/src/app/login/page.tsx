"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 py-12">
        <Link
          href="/"
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-600 shadow-md transition-opacity hover:opacity-90"
          aria-label="Inicio Nutrición V9"
        >
          <span className="text-2xl font-extrabold tracking-tight text-white">
            N9
          </span>
        </Link>

        <h1 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Iniciar sesión
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nutrición V9 — ingresá a tu cuenta
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 w-full space-y-4 rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-gray-100 sm:p-8"
        >
          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
              placeholder="Tu contraseña"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Ingresando…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          ¿No tenés cuenta?{" "}
          <Link
            href="/register"
            className="font-medium text-green-700 underline-offset-2 hover:text-green-800 hover:underline"
          >
            Registrate
          </Link>
        </p>
      </div>
    </main>
  );
}
