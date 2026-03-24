"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase";

const cards = [
  {
    icon: "🧬",
    title: "Perfil de salud",
    subtitle: "Cargá tus datos clínicos",
  },
  {
    icon: "🥗",
    title: "Analizar alimento",
    subtitle: "Fotografiá o describí un alimento",
  },
  {
    icon: "📈",
    title: "Mi evolución",
    subtitle: "Ver historial y gráficos",
  },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setSigningOut(false);
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 px-4 py-4 shadow-md sm:px-6">
        <div className="mx-auto flex max-w-5xl items-start justify-between gap-4">
          <div className="min-w-0 pt-0.5">
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Bienvenido a Nutrición V9
            </h1>
            <p className="mt-1 text-sm text-green-100">
              Tu perfil de salud está listo para configurar
            </p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-green-900 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
          >
            {signingOut ? "Saliendo…" : "Cerrar sesión"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <article
              key={card.title}
              className="flex flex-col rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/80 transition-shadow hover:shadow-md"
            >
              <span className="text-4xl" aria-hidden>
                {card.icon}
              </span>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {card.title}
              </h2>
              <p className="mt-1 text-sm text-gray-600">{card.subtitle}</p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
