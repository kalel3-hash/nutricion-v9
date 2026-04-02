"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function AnalizarClient({
  userId,
}: {
  userId: string;
}) {
  const supabase = createClient();

  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [foodDescription, setFoodDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) setProfile(data);
      setLoadingProfile(false);
    };

    loadProfile();
  }, [supabase, userId]);

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
          health_profile: profile,
        }),
      });

      if (!response.ok) throw new Error("Error en el motor de IA");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        text += decoder.decode(value);
        setAnalysis(text);
      }

      const scoreMatch = text.match(/(\d+)\s*\/\s*10/);

      await supabase.from("analysis_history").insert({
        user_id: userId,
        food_description: foodDescription,
        analysis_result: text,
        score: scoreMatch ? parseInt(scoreMatch[1]) : null,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error de conexión"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando perfil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center">
        <h1 className="font-bold">VitalCross AI</h1>
        <Link
          href="/dashboard"
          className="bg-green-800 px-4 py-1 rounded-md text-sm"
        >
          Volver
        </Link>
      </header>

      <main className="max-w-xl mx-auto p-4 mt-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {!profile && (
            <div className="mb-4 bg-amber-50 p-3 rounded text-xs">
              Análisis estándar (sin perfil) —{" "}
              <Link href="/perfil" className="underline">
                Cargar perfil
              </Link>
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-600">{error}</div>
          )}

          <textarea
            className="w-full border rounded p-4 h-32"
            placeholder="Ej: Milanesa con puré"
            value={foodDescription}
            onChange={(e) =>
              setFoodDescription(e.target.value)
            }
          />

          <button
            onClick={handleAnalyze}
            disabled={loading || !foodDescription.trim()}
            className="w-full mt-4 bg-green-700 text-white py-3 rounded font-bold"
          >
            {loading ? "PROCESANDO..." : "ANALIZAR"}
          </button>

          {analysis && (
            <pre className="mt-6 bg-gray-50 p-4 rounded whitespace-pre-wrap">
              {analysis}
            </pre>
          )}
        </div>
      </main>
    </div>
  );
}
