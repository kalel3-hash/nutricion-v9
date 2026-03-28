"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function AnalizarPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [foodDescription, setFoodDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();
      let session = null;
      const { data: sessionData } = await supabase.auth.getSession();
      session = sessionData.session;
      if (!session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData.session;
      }
      if (!session) {
        setError("Necesitás iniciar sesión para usar esta función.");
        setLoadingProfile(false);
        return;
      }
      const { data } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      setProfile(data);
      setLoadingProfile(false);
    };
    loadData();
  }, []);

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
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en el análisis");
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const formatAnalysis = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("BLOQUE")) {
        return <p key={i} className="text-green-900 font-bold mt-4 mb-1">{line}</p>;
      }
      if (line.includes("⚠️")) {
        return <p key={i} className="text-orange-600 mt-4 p-2 bg-orange-50 rounded">{line}</p>;
      }
      return <p key={i} className="text-gray-700 mb-1">{line}</p>;
    });
  };
return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Analizar alimento</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded hover:bg-green-600">
          Volver
        </Link>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        {loadingProfile ? (
          <p className="text-gray-500 text-xl">Cargando perfil...</p>
        ) : (
          <div className="bg-white rounded-xl shadow p-6">
            {error && (
              <p className="text-red-500 mb-4">
                {error}{" "}
                <Link href="/login" className="underline">Ir al login</Link>
              </p>
            )}
            {!error && !profile && (
              <p className="text-yellow-600 mb-4">
                ⚠️ No tenés perfil de salud cargado.{" "}
                <Link href="/perfil" className="underline">Completá tu perfil</Link>
              </p>
            )}
            {!error && (
              <>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
                  placeholder="Describí el alimento que querés analizar."
                  value={foodDescription}
                  onChange={(e) => setFoodDescription(e.target.value)}
                />
                <button
                  onClick={handleAnalyze}
                  disabled={loading || !foodDescription.trim()}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "🔍 Analizando con tu perfil de salud..." : "Analizar"}
                </button>
                {analysis && (
                  <div className="mt-6 border-t pt-4">
                    {formatAnalysis(analysis)}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}