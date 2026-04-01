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
    const supabase = createClient();
    let retryCount = 0;
    const maxRetries = 3;

    const checkSession = async () => {
      // 1. Intentamos obtener sesión de forma directa
      let { data: { session } } = await supabase.auth.getSession();
      
      // 2. Si no hay, intentamos refrescarla (vital para Google OAuth)
      if (!session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData.session;
      }

      if (session) {
        setError("");
        const { data } = await supabase
          .from("health_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        
        setProfile(data);
        setLoadingProfile(false);
      } else if (retryCount < maxRetries) {
        // 3. Si falla, reintentamos un par de veces con delay
        retryCount++;
        setTimeout(checkSession, 1000);
      } else {
        // 4. Si después de 3 intentos no hay nada, mostramos error
        setError("No logramos detectar tu sesión de Google.");
        setLoadingProfile(false);
      }
    };

    checkSession();
  }, []);

  const handleAnalyze = async () => {
    if (!foodDescription.trim()) return;
    setLoading(true);
    setAnalysis("");
    setError("");

    try {
      const supabase = createClient();
      let { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData.session;
      }

      if (!session) throw new Error("La sesión expiró. Por favor, volvé a iniciar sesión.");

      const response = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_description: foodDescription,
          health_profile: profile,
        }),
      });

      if (!response.ok) throw new Error("Error en el servidor de análisis");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setAnalysis(accumulatedText);
      }

      const scoreMatch = accumulatedText.match(/\*{0,2}(\d+)\*{0,2}\s*\/\s*10/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
      
      // FIX: user_id con un solo guion bajo 
      await supabase.from("analysis_history").insert({
        user_id: session.user.id,
        food_description: foodDescription,
        analysis_result: accumulatedText,
        score,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getScoreStyle = (score: number) => {
    if (score <= 3) return { bg: "bg-red-500", label: score <= 2 ? "PROHIBIDO" : "DESACONSEJADO", textColor: "text-white" };
    if (score <= 7) return { bg: "bg-yellow-400", label: score <= 4 ? "DESACONSEJADO" : score <= 6 ? "NEUTRO" : "RECOMENDABLE", textColor: "text-yellow-900" };
    return { bg: "bg-green-500", label: score <= 8 ? "RECOMENDABLE" : "ALTAMENTE RECOMENDABLE", textColor: "text-white" };
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

    if (sections.length === 0) return <div className="text-gray-700 text-sm whitespace-pre-wrap">{text}</div>;

    return (
      <div className="flex flex-col gap-4">
        {sections.map((section, i) => {
          const block = blocks[section.blockIndex];
          const content = section.lines.join("\n").trim();
          if (section.blockIndex === 0) {
            const scoreMatch = content.match(/\*{0,2}(\d+)\*{0,2}\s*\/\s*10/);
            const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
            const style = score ? getScoreStyle(score) : null;
            const summaryLines = content.split("\n").filter(l => !l.match(/\d+\/10/) && l.trim()).map(l => l.replace(/\*\*/g, ""));
            return (
              <div key={i} className={`rounded-xl border ${block.border} ${block.bg} p-4`}>
                <h3 className={`font-bold text-base mb-3 ${block.titleColor}`}>{block.title}</h3>
                {score && style && (
                  <div className={`${style.bg} rounded-xl p-4 flex items-center gap-5 mb-3`}>
                    <div className={`${style.textColor} text-center min-w-16`}>
                      <div className="text-6xl font-black leading-none">{score}</div>
                      <div className="text-sm font-medium opacity-80">/ 10</div>
                    </div>
                    <div className={`${style.textColor}`}><div className="text-2xl font-bold">{style.label}</div></div>
                  </div>
                )}
                <div className="text-gray-700 text-sm leading-relaxed space-y-1">{summaryLines.map((line, j) => (<p key={j}>{line}</p>))}</div>
              </div>
            );
          }
          return (
            <div key={i} className={`rounded-xl border ${block.border} ${block.bg} p-4`}>
              <h3 className={`font-bold text-base mb-2 ${block.titleColor}`}>{block.title}</h3>
              <div className="text-gray-700 text-sm leading-relaxed space-y-1">
                {content.split("\n").map((line, j) => {
                  const clean = line.replace(/\*\*/g, "");
                  return line.includes("⚠️") ? <p key={j} className="text-orange-600 font-medium mt-2">{clean}</p> : <p key={j}>{clean}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-green-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold">Analizar alimento</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">Volver</Link>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        {loadingProfile ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4"></div>
            <p className="text-gray-500 text-lg font-medium">Verificando tu perfil...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-4 text-center">
                <p className="text-red-600 font-medium mb-4">{error}</p>
                <div className="flex flex-col gap-3">
                   <Link href="/login" className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors">
                     Ir al Login
                   </Link>
                   <button onClick={() => window.location.reload()} className="text-gray-500 text-sm underline">
                     Reintentar cargar página
                   </button>
                </div>
              </div>
            )}
            {!error && !profile && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
                <p className="text-amber-800 text-sm">
                  ⚠️ <strong>Aviso:</strong> No detectamos un perfil de salud. El análisis será genérico. 
                  <Link href="/perfil" className="ml-2 underline font-bold">Completar perfil</Link>
                </p>
              </div>
            )}
            {!error && (
              <>
                <div className="mb-6">
                  <label className="block text-gray-700 font-bold mb-2">¿Qué vas a comer?</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-xl p-4 h-32 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" 
                    placeholder="Ej: Dos empanadas de carne fritas y una coca cola original." 
                    value={foodDescription} 
                    onChange={(e) => setFoodDescription(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={handleAnalyze} 
                  disabled={loading || !foodDescription.trim()} 
                  className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                >
                  {loading ? "🔍 Analizando..." : "Realizar Análisis VitalCross"}
                </button>
                {analysis && <div className="mt-8 border-t pt-6">{formatAnalysis(analysis)}</div>}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}