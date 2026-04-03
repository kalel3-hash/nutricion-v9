"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  created_at?: string;
  food_description?: string;
  score?: number | null;
  analysis_result?: string;
};

export default function HistorialClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/history", { method: "GET" });
      const json = await res.json();
      setItems(json.items ?? []);
    } catch (e: any) {
      setError(e?.message || "Error cargando historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="font-bold">VitalCross AI</h1>
        <Link href="/dashboard" className="bg-green-800 px-4 py-1 rounded-md text-sm">
          Volver
        </Link>
      </header>

      <main className="max-w-3xl mx-auto p-4 mt-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-black">Historial</h1>
              <button
                onClick={load}
                className="text-sm font-bold underline text-green-800"
                disabled={loading}
              >
                {loading ? "Actualizando…" : "Actualizar"}
              </button>
            </div>

            {error && (
              <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {loading ? (
              <div className="mt-6 text-gray-600 italic">Cargando…</div>
            ) : items.length === 0 ? (
              <div className="mt-6 text-gray-600">
                Todavía no hay análisis guardados.
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {items.map((it) => {
                  const opened = openId === it.id;
                  return (
                    <div key={it.id} className="border border-gray-100 rounded-xl p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <div className="font-bold truncate">
                            {it.food_description ?? "Sin descripción"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {it.created_at ? new Date(it.created_at).toLocaleString() : ""}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-sm font-black">
                            {it.score != null ? `${it.score}/10` : "—"}
                          </div>

                          <button
                            onClick={() => toggle(it.id)}
                            className="text-sm font-bold underline text-green-800"
                          >
                            {opened ? "Ocultar" : "Ver"}
                          </button>
                        </div>
                      </div>

                      {opened && it.analysis_result && (
                        <div className="mt-3">
                          <div className="flex justify-end">
                            <button
                              className="text-xs font-bold underline text-gray-600"
                              onClick={() => navigator.clipboard.writeText(it.analysis_result || "")}
                            >
                              Copiar análisis
                            </button>
                          </div>
                          <pre className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
                            {it.analysis_result}
                          </pre>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}