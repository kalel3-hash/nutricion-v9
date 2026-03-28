"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

type AnalysisItem = {
  id: string;
  food_description: string;
  analysis_result: string;
  score: number | null;
  created_at: string;
};

export default function HistorialPage() {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AnalysisItem | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError("Necesitás iniciar sesión.");
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      else setItems(data || []);
      setLoading(false);
    };
    loadHistory();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const scoreColor = (score: number | null) => {
    if (!score) return "bg-gray-100 text-gray-600";
    if (score <= 2) return "bg-red-100 text-red-700";
    if (score <= 4) return "bg-orange-100 text-orange-700";
    if (score <= 6) return "bg-yellow-100 text-yellow-700";
    if (score <= 8) return "bg-green-100 text-green-700";
    return "bg-emerald-100 text-emerald-700";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Mi historial</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded hover:bg-green-600 text-sm">
          Volver
        </Link>
      </header>
      <main className="max-w-2xl mx-auto p-6">
        {loading && <p className="text-gray-500">Cargando historial...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500 mb-4">Todavía no analizaste ningún alimento.</p>
            <Link href="/analizar" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Analizar mi primer alimento
            </Link>
          </div>
        )}
        {selected && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="font-bold text-gray-900">{selected.food_description}</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="text-sm text-gray-500 mb-4">{formatDate(selected.created_at)}</div>
            <div className="text-gray-700 text-sm whitespace-pre-wrap">{selected.analysis_result}</div>
          </div>
        )}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => setSelected(selected?.id === item.id ? null : item)}
              className="bg-white rounded-xl shadow p-4 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">{item.food_description}</span>
                {item.score && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${scoreColor(item.score)}`}>
                    {item.score}/10
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">{formatDate(item.created_at)}</div>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}