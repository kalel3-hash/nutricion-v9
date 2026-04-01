"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function AnalizarPage() {
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
  const [foodDescription, setFoodDescription] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(true);

  const loadSession = useCallback(async () => {
    const supabase = createClient();
    
    try {
      // 1. Intentamos refrescar activamente la sesión (fuerza la lectura de cookies de Google)
      const { data: { session }, error: sessionError } = await supabase.auth.refreshSession();
      
      if (sessionError) throw sessionError;

      if (session) {
        setError("");
        // 2. Buscamos el perfil usando el ID de la sesión confirmada
        const { data, error: profileError } = await supabase
          .from("health_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        
        if (data) setProfile(data);
        setLoadingProfile(false);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Error en verificación de sesión:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      const success = await loadSession();
      if (!success && mounted) {
        // Segundo intento tras breve espera por si Google está lento
        setTimeout(async () => {
          const secondTry = await loadSession();
          if (!secondTry && mounted) {
            setError("No logramos detectar tu sesión de Google.");
            setLoadingProfile(false);
          }
        }, 2000);
      }
    };

    init();
    return () => { mounted = false; };
  }, [loadSession]);

  const handleAnalyze = async () => {
    if (!foodDescription.trim()) return;
    setLoading(true);
    setAnalysis("");
    setError("");

    try {
      const supabase = createClient();
      // Usamos getSession como respaldo final
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("La sesión no está activa. Reingresá por favor.");

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
        accumulatedText += decoder.decode(value);
        setAnalysis(accumulatedText);
      }

      const scoreMatch = accumulatedText.match(/\*{0,2}(\d+)\*{0,2}\s*\/\s*10/);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : null;
      
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

  // ... (Funciones getScoreStyle y formatAnalysis se mantienen iguales para ahorrar espacio)
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
            return (
              <div key={i} className={`rounded-xl border ${block.border} ${block.bg} p-4`}>
                <h3 className={`font-bold text-base mb-3 ${block.titleColor}`}>{block.title}</h3>
                {score && style && (
                  <div className={`${style.bg} rounded-xl p-4 flex items-center gap-5 mb-3`}>
                    <div className={`${style.textColor} text-center min-w-16`}>
                      <div className="text-6xl font-black leading-none">{score}</div>
                    </div>
                    <div className={`${style.textColor}`}><div className="text-2xl font-bold">{style.label}</div></div>
                  </div>
                )}
                <div className="text-gray-700 text-sm leading-relaxed">{content}</div>
              </div>
            );
          }
          return (
            <div key={i} className={`rounded-xl border ${block.border} ${block.bg} p-4`}>
              <h3 className={`font-bold text-base mb-2 ${block.titleColor}`}>{block.title}</h3>
              <div className="text-gray-700 text-sm whitespace-pre-wrap">{content}</div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">VitalCross AI - Analizador</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded-lg hover:bg-green-600 transition-all">Volver</Link>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        {loadingProfile ? (
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mb-4"></div>
            <p className="text-gray-600 font-medium italic">Sincronizando con Google...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {error ? (
              <div className="bg-red-50 border-2 border-red-100 rounded-xl p-8 text-center">
                <p className="text-red-600 font-bold text-lg mb-6">{error}</p>
                <div className="flex flex-col gap-4">
                  <Link href="/login" className="bg-red-600 text-white px-8 py-4 rounded-xl font-black uppercase tracking-wider hover:bg-red-700 shadow-lg">Reiniciar Sesión</Link>
                  <button onClick={() => window.location.reload()} className="text-gray-400 text-sm underline hover:text-gray-600">Reintentar conexión rápida</button>
                </div>
              </div>
            ) : (
              <>
                {!profile && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6 flex gap-3 items-center">
                    <span className="text-2xl">⚠️</span>
                    <p className="text-amber-800 text-sm italic">Perfil no detectado. El análisis será estándar. <Link href="/perfil" className="font-bold underline">Cargar perfil clínico</Link></p>
                  </div>
                )}
                <div className="mb-6">
                  <label className="block text-gray-800 font-black mb-2 uppercase text-xs tracking-widest">¿Qué alimento quieres analizar?</label>
                  <textarea 
                    className="w-full border-2 border-gray-100 rounded-2xl p-5 h-40 focus:border-green-500 outline-none transition-all text-gray-700 shadow-inner"
                    placeholder="Ej: Desayuno: 2 huevos revueltos con palta y café sin azúcar..." 
                    value={foodDescription} 
                    onChange={(e) => setFoodDescription(e.target.value)} 
                  />
                </div>
                <button 
                  onClick={handleAnalyze} 
                  disabled={loading || !foodDescription.trim()} 
                  className="w-full bg-green-700 text-white py-5 rounded-2xl font-black text-xl hover:bg-green-800 disabled:opacity-30 shadow-xl transition-all transform hover:-translate-y-1 active:scale-95"
                >
                  {loading ? "✨ PROCESANDO ANÁLISIS..." : "ANALIZAR AHORA"}
                </button>
                {analysis && <div className="mt-10 space-y-6">{formatAnalysis(analysis)}</div>}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}