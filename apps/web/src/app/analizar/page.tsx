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

  const verifyAuth = useCallback(async () => {
    const supabase = createClient();
    try {
      // 1. Forzamos el refresco de sesión para capturar la cookie de Google
      const { data: { session }, error: authError } = await supabase.auth.refreshSession();
      
      if (authError || !session) {
        // Segundo intento: obtener sesión persistente
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        if (!retrySession) return false;
        return await loadProfile(retrySession.user.id);
      }

      return await loadProfile(session.user.id);
    } catch (err) {
      return false;
    }
  }, []);

  const loadProfile = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("health_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (data) setProfile(data);
    return true;
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      const isAuth = await verifyAuth();
      if (active) {
        if (!isAuth) {
          setError("No logramos detectar tu sesión de Google.");
        }
        setLoadingProfile(false);
      }
    };
    init();
    return () => { active = false; };
  }, [verifyAuth]);

  const handleAnalyze = async () => {
    if (!foodDescription.trim()) return;
    setLoading(true);
    setAnalysis("");
    setError("");

    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) throw new Error("Sesión expirada. Por favor reiniciá.");

      const response = await fetch("/api/analizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          food_description: foodDescription,
          health_profile: profile,
        }),
      });

      if (!response.ok) throw new Error("Error en el servidor");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        text += decoder.decode(value);
        setAnalysis(text);
      }

      const scoreMatch = text.match(/\*{0,2}(\d+)\*{0,2}\s*\/\s*10/);
      await supabase.from("analysis_history").insert({
        user_id: session.user.id,
        food_description: foodDescription,
        analysis_result: text,
        score: scoreMatch ? parseInt(scoreMatch[1]) : null,
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  // Renderizado simplificado para asegurar que funcione
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-green-800 font-bold animate-pulse text-xl">Sincronizando con VitalCross...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-lg">VitalCross AI</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded">Volver</Link>
      </header>
      <main className="max-w-xl mx-auto p-6">
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          {error ? (
            <div className="text-center py-8">
              <p className="text-red-600 font-bold mb-6">{error}</p>
              <Link href="/login" className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold block shadow-lg">REINICIAR SESIÓN</Link>
            </div>
          ) : (
            <>
              <h2 className="text-gray-800 font-black mb-4 uppercase text-sm tracking-widest">Análisis Nutricional Vital</h2>
              <textarea 
                className="w-full border-2 border-gray-100 rounded-xl p-4 h-40 focus:border-green-500 outline-none text-gray-700 mb-6"
                placeholder="Ej: Almuerzo: Ensalada César con pollo y agua."
                value={foodDescription}
                onChange={(e) => setFoodDescription(e.target.value)}
              />
              <button 
                onClick={handleAnalyze}
                disabled={loading || !foodDescription.trim()}
                className="w-full bg-green-700 text-white py-4 rounded-xl font-black text-lg shadow-xl active:scale-95 transition-transform"
              >
                {loading ? "PROCESANDO..." : "ANALIZAR AHORA"}
              </button>
              {analysis && (
                <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <pre className="whitespace-pre-wrap text-sm text-blue-900 font-sans leading-relaxed">{analysis}</pre>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}