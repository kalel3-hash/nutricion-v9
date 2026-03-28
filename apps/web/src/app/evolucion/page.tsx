"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

type AnalysisItem = {
  id: string;
  food_description: string;
  score: number | null;
  created_at: string;
};

type ChartPoint = {
  fecha: string;
  puntaje: number;
  alimento: string;
};

export default function EvolucionPage() {
  const [items, setItems] = useState<AnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setError("Necesitás iniciar sesión."); setLoading(false); return; }

      const { data } = await supabase
        .from("analysis_history")
        .select("*")
        .eq("user_id", session.user.id)
        .not("score", "is", null)
        .order("created_at", { ascending: true });

      setItems(data || []);
      setLoading(false);
    };
    load();
  }, []);

  const chartData: ChartPoint[] = items
    .filter(i => i.score !== null)
    .map(i => ({
      fecha: new Date(i.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit" }),
      puntaje: i.score!,
      alimento: i.food_description,
    }));

  const promedio = chartData.length > 0
    ? Math.round(chartData.reduce((sum, i) => sum + i.puntaje, 0) / chartData.length * 10) / 10
    : null;

  const scoreColor = (score: number) => {
    if (score <= 2) return "text-red-600";
    if (score <= 4) return "text-orange-500";
    if (score <= 6) return "text-yellow-600";
    if (score <= 8) return "text-green-600";
    return "text-emerald-600";
  };

  const scoreLabel = (score: number) => {
    if (score <= 2) return "Muy malo";
    if (score <= 4) return "Malo";
    if (score <= 6) return "Regular";
    if (score <= 8) return "Bueno";
    return "Excelente";
  };

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm max-w-48">
          <p className="font-semibold text-gray-900 mb-1">{d.alimento}</p>
          <p className="text-gray-500">{d.fecha}</p>
          <p className={`font-bold text-lg ${scoreColor(d.puntaje)}`}>{d.puntaje}/10</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Mi evolución</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded hover:bg-green-600 text-sm">
          Volver
        </Link>
      </header>

      <main className="max-w-3xl mx-auto p-6">
        {loading && <p className="text-gray-500">Cargando datos...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && chartData.length === 0 && (
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <p className="text-gray-500 mb-4">Todavía no tenés análisis con puntaje.</p>
            <Link href="/analizar" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Analizar mi primer alimento
            </Link>
          </div>
        )}

        {!loading && chartData.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Análisis totales</p>
                <p className="text-3xl font-bold text-gray-900">{chartData.length}</p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Puntaje promedio</p>
                <p className={`text-3xl font-bold ${promedio ? scoreColor(promedio) : ""}`}>
                  {promedio}/10
                </p>
              </div>
              <div className="bg-white rounded-xl shadow p-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Tendencia</p>
                <p className={`text-lg font-bold ${promedio ? scoreColor(promedio) : ""}`}>
                  {promedio ? scoreLabel(promedio) : "-"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Puntaje por análisis</h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="fecha" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine y={5} stroke="#e5e7eb" strokeDasharray="4 4" />
                  <Line
                    type="monotone"
                    dataKey="puntaje"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    dot={{ fill: "#16a34a", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Últimos análisis</h2>
              <div className="flex flex-col gap-2">
                {[...items].reverse().slice(0, 10).map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-700 truncate mr-4">{item.food_description}</span>
                    <span className={`text-sm font-bold shrink-0 ${scoreColor(item.score!)}`}>
                      {item.score}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}