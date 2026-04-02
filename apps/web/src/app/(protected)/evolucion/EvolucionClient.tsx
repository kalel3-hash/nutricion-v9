"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type EvolutionRow = {
  id: string;
  created_at: string;
  food_description: string;
  score: number | null;
};

export default function EvolucionClient({ userId }: { userId: string }) {
  const supabase = createClient();
  const [rows, setRows] = useState<EvolutionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      const { data, error: qError } = await supabase
        .from("analysis_history")
        .select("id, created_at, food_description, score")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (qError) {
        setError(qError.message);
        setRows([]);
      } else {
        setRows((data as EvolutionRow[]) ?? []);
      }

      setLoading(false);
    };

    load();
  }, [supabase, userId]);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold">VitalCross AI</h1>
        <Link href="/dashboard" className="bg-green-800 px-4 py-1 rounded-md text-sm">
          Volver
        </Link>
      </header>

      <main className="max-w-2xl mx-auto p-4 mt-4">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold mb-4">Evolución</h2>

          {loading && (
            <div className="text-gray-600 italic">
              Cargando datos...
            </div>
          )}

          {!loading && error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!loading && !error && rows.length === 0 && (
            <div className="text-gray-600">
              Todavía no hay análisis guardados.
            </div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="space-y-3">
              {rows.map((r) => (
                <div
                  key={r.id}
                  className="border border-gray-100 rounded-xl p-4 flex items-start justify-between gap-4"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">
                      {r.food_description}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(r.created_at).toLocaleString()}
                    </div>
                  </div>

                  <div className="shrink-0">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-800">
                      {r.score === null ? "—" : `${r.score}/10`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}