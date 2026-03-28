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

      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const scoreMatch = data.analysis.match(/(\d+)\/10/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
        await supabase.from("analysis_history").insert({
          user_id: session.user.id,
          food_description: foodDescription,
          analysis_result: data.analysis,
          score,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getScoreStyle = (score: number) => {
    if (score <= 3) return {
      bg: "bg-red-500",
      label: score <= 2 ? "PROHIBIDO" : "DESACONSEJADO",
      textColor: "text-white",
    };
    if (score <= 7) return {
      bg: score <= 4 ? "bg-yellow-400" : score <= 6 ? "bg-yellow-400" : "bg-yellow-400",
      label: score <= 4 ? "DESACONSEJADO" : score <= 6 ? "NEUTRO" : "RECOMENDABLE",
      textColor: "text-yellow-900",
    };
    return {
      bg: "bg-green-500",
      label: score <= 8 ? "RECOMENDABLE" : "ALTAMENTE RECOMENDABLE",
      textColor: "text-white",
    };
  };

  const formatAnalysis = (text: string) => {
    const blocks = [
      { key: "BLOQUE 1", title: "🎯 Puntaje", bg: "bg-blue-50", border: "border-blue-200", titleColor: "text-blue-800" },
      { key: "BLOQUE 2", title: "🔬 Análisis personalizado", bg: "bg-purple-50", border: "border-purple-200", titleColor: "text-purple-800" },
      { key: "BLOQUE 3", title: "💡 Sugerencias de mejora", bg: "bg-amber-50", border: "border-amber-200", titleColor: "text-amber-800" },
      { key: "BLOQUE 4", title: "📚 Fuentes", bg: "bg-gray-50", border: "border-gray-200", titleColor: "text-gray-700" },
    ];

    const lines = text.split("\n");
    const sections: { blockIndex: number; lines: string[] }[] = [];
    let currentBlock = -1;

    lines.forEach((line) => {
      const blockMatch = blocks.findIndex((b) => line.includes(b.key));
      if (blockMatch >= 0) {
        currentBlock = blockMatch;
        sections.push({ blockIndex: blockMatch, lines: [] });
      } else if (currentBlock >= 0 && sections.length > 0) {
        sections[sections.length - 1].lines.push(line);
      }
    });

    if (sections.length === 0) {
      return <div className="text-gray-700 text-sm whitespace-pre-wrap">{text}</div>;
    }

    return (
      <div className="flex flex-col gap-4">
        {sections.map((section, i) => {
          const block = blocks[section.blockIndex];
          const content = section.lines.join("\n").trim();
          const isScoreBlock = section.blockIndex === 0;

          if (isScoreBlock) {
            const scoreMatch = content.match(/\*{0,2}(\d+)\*{0,2}\s*\/\s*10/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
            const style = score ? getScoreStyle(score) : null;
            const summaryLines = content
              .split("\n")
              .filter(l => !l.match(/\d+\/10/) && l.trim())
              .map(l => l.replace(/\*\*/g, ""));

            return (
              <div key={i} className={`rounded-xl border ${block.border} ${block.bg} p-4`}>
                <h3 className={`font-bold text-base mb-3 ${block.titleColor}`}>{block.title}</h3>
                {score && style && (
                  <div className={`${style.bg} rounded-xl p-4 flex items-center gap-5 mb-3`}>
                    <div className={`${style.textColor} text-center min-w-16`}>
                      <div className="text-6xl font-black leading-none">{score}</div>
                      <div className="text-sm font-medium opacity-80">/ 10</div>
                    </div>
                    <div className={`${style.textColor}`}>
                      <div className="text-2xl font-bold">{style.label}</div>
                    </div>
                  </div>
                )}
                <div className="text-gray-700 text-sm leading-relaxed space-y-1">
                  {summaryLines.map((line, j) => (
                    <p key={j}>{line}</p>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div key={i} className={`rounded-xl border ${block.border} ${block.bg} p-4`}>
              <h3 className={`font-bold text-base mb-2 ${block.titleColor}`}>{block.title}</h3>
              <div className="text-gray-700 text-sm leading-relaxed space-y-1">
                {content.split("\n").map((line, j) => {
                  const clean = line.replace(/\*\*/g, "");
                  return line.includes("⚠️") ? (
                    <p key={j} className="text-orange-600 font-medium mt-2">{clean}</p>
                  ) : (
                    <p key={j}>{clean}</p>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
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