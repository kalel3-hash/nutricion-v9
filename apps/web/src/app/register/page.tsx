"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    setSuccess(true);
    setFullName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
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
          Crear cuenta
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nutrición V9 — registrate para continuar
        </p>

        <div className="mt-8 w-full rounded-2xl bg-white/80 p-6 shadow-sm ring-1 ring-gray-100 sm:p-8">
          {success ? (
            <div className="space-y-4 text-center">
              <p className="rounded-xl bg-green-50 px-4 py-4 text-sm font-medium text-green-800">
                ¡Cuenta creada! Revisá tu email para confirmar tu cuenta.
              </p>
              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-green-600 bg-white px-6 py-3 text-base font-semibold text-green-700 transition-colors hover:bg-green-50"
              >
                Ir a iniciar sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error ? (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
                  {error}
                </p>
              ) : null}

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Tu nombre"
                />
              </div>

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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                  placeholder="Repetí la contraseña"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creando cuenta…" : "Crear cuenta"}
              </button>
            </form>
          )}
        </div>

        {!success ? (
          <p className="mt-6 text-center text-sm text-gray-500">
            ¿Ya tenés cuenta?{" "}
            <Link
              href="/login"
              className="font-medium text-green-700 underline-offset-2 hover:text-green-800 hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        ) : null}
      </div>
    </main>
  );
}
