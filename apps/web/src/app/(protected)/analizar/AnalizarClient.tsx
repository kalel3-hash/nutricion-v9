"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type ProfileResponse = { profile: any | null; error?: string };

export default function AnalizarClient() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [foodDescription, setFoodDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 1) Cargar perfil clínico desde /api/profile (NextAuth -> Supabase por owner_email)
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const res = await fetch("/api/profile", { method: "GET" });
        const json = (await res.json()) as ProfileResponse;

        if (!mounted) return;

        // Si hay error, lo ignoramos y seguimos con análisis estándar
        setProfile(json.profile ?? null);
      } catch {
        if (!mounted) return;
        setProfile(null);
      } finally {
        if (!mounted) return;
        setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  // 2) Analizar comida (stream) y guardar historial con /api/history
  const handleAnalyze = async () => {
    if (!foodDescription.trim()) return;

    setLoading(true);
    setAnalysis("");
    setError("");

    try {
      const response = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_description: foodDescription,
          health_profile: profile, // puede ser null => análisis estándar
        }),
      });

      if (!response.ok) throw new Error("Error en el motor de IA");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo leer la respuesta del motor de IA");

      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value);
        setAnalysis(text);
      }

      // Buscar un score tipo "7/10"
      const scoreMatch = text.match(/(\d+)\s*\/\s*10/);
      const score = scoreMatch ? parseInt(scoreMatch[1], 10) : null;

      // Guardar historial (server-side) por owner_email
      const saveRes = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_description: foodDescription,
          analysis_result: text,
          score,
        }),
      });

      // Si falla guardar historial, no rompemos la UI: solo avisamos en consola
      if (!saveRes.ok) {
        const j = await saveRes.json().catch(() => null);
        console.warn("No se pudo guardar historial:", j);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600 italic">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold">VitalCross AI</h1>
        <Link href="/dashboard" className="bg-green-800 px-4 py-1 rounded-md text-sm">
          Volver
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-4 mt-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            {!profile && (
              <div className="mb-4 bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-center gap-2">
                <span className="text-amber-600 text-xs font-bold italic">
                  ⚠️ Análisis estándar (Sin perfil clínico)
                </span>
                <Link href="/perfil" className="text-amber-800 text-xs underline font-bold">
                  Cargar perfil
                </Link>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}

            <label className="block text-gray-700 text-xs font-bold uppercase mb-2">
              ¿Qué vas a comer?
            </label>

            <textarea
              className="w-full border-2 border-gray-100 rounded-xl p-4 h-36 focus:border-green-500 outline-none transition-all"
              placeholder="Ej: Milanesa con puré y un vaso de jugo de naranja."
              value={foodDescription}
              onChange={(e) => setFoodDescription(e.target.value)}
            />

            <button
              onClick={handleAnalyze}
              disabled={loading || !foodDescription.trim()}
              className="w-full mt-4 bg-green-700 text-white py-4 rounded-xl font-black shadow-lg active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "PROCESANDO..." : "ANALIZAR AHORA"}
            </button>

            {analysis && (
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                    {analysis}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
