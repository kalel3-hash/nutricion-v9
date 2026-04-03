"use client";

import { useEffect, useState } from "react";

type ProfileResponse =
  | { profile: any | null; reason?: string; error?: string }
  | { ok: boolean; profile?: any | null; error?: string };

export default function PerfilFormClient() {
  const [age, setAge] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<string>("");
  const [current, setCurrent] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setStatus("");
    const res = await fetch("/api/profile", { method: "GET" });
    const json = (await res.json()) as ProfileResponse;
    if ("profile" in json) {
      setCurrent(json.profile ?? null);
      setAge((json.profile?.age ?? "").toString());
      setNotes((json.profile?.notes ?? "").toString());
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setLoading(true);
    setStatus("");
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // IMPORTANTE: same-origin -> el navegador manda cookies automáticamente
        body: JSON.stringify({ age, notes }),
      });

      const json = (await res.json()) as ProfileResponse;

      if ("ok" in json && json.ok) {
        setStatus("✅ Guardado OK");
        await load();
      } else {
        const msg = (json as any)?.error || `Error HTTP ${res.status}`;
        setStatus(`❌ ${msg}`);
      }
    } catch (e: any) {
      setStatus(`❌ ${e?.message || "Error de red"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
      <div className="p-6">
        <h2 className="font-black mb-3">Cargar perfil clínico (prueba)</h2>

        {status && (
          <div className="mb-3 text-sm font-medium">
            {status}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Edad (ejemplo)
            </label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none transition-all"
              placeholder="Ej: 30"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Notas (ejemplo)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border-2 border-gray-100 rounded-xl p-3 h-24 focus:border-green-500 outline-none transition-all"
              placeholder="Ej: intolerancia a lactosa..."
            />
          </div>

          <button
            onClick={save}
            disabled={loading}
            className="w-full mt-2 bg-green-700 text-white py-3 rounded-xl font-black shadow-lg active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "GUARDANDO..." : "Guardar perfil"}
          </button>

          <div className="text-xs text-gray-500">
            Perfil actual:{" "}
            <code>{current ? "Existe (no null)" : "null"}</code>
          </div>
        </div>
      </div>
    </div>
  );
}