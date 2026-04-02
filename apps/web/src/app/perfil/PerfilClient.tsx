"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

/* =========================
   Tipado
========================= */
type HealthProfileRow = {
  user_id: string;
  full_name: string | null;
  age: number | null;
  sex: string | null;
  total_cholesterol_mg_dl: number | null;
  hdl_mg_dl: number | null;
  ldl_mg_dl: number | null;
  triglycerides_mg_dl: number | null;
  fasting_glucose_mg_dl: number | null;
  creatinine_mg_dl: number | null;
};

export default function PerfilClient({
  userId,
}: {
  userId: string | null;
}) {
  const supabase = createClient();

  /* =========================
     Manejo OAuth (CLAVE)
  ========================= */
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 font-medium">
        Verificando sesión...
      </div>
    );
  }

  /* =========================
     Estados de Perfil
  ========================= */
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [totalChol, setTotalChol] = useState("");
  const [hdl, setHdl] = useState("");
  const [ldl, setLdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [creatinine, setCreatinine] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  /* =========================
     Cargar perfil
  ========================= */
  useEffect(() => {
    const loadProfile = async () => {
      const { data } = await supabase
        .from("health_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (data) {
        setFullName(data.full_name ?? "");
        setAge(data.age?.toString() ?? "");
        setSex(data.sex ?? "");
        setTotalChol(data.total_cholesterol_mg_dl?.toString() ?? "");
        setHdl(data.hdl_mg_dl?.toString() ?? "");
        setLdl(data.ldl_mg_dl?.toString() ?? "");
        setTriglycerides(data.triglycerides_mg_dl?.toString() ?? "");
        setFastingGlucose(data.fasting_glucose_mg_dl?.toString() ?? "");
        setCreatinine(data.creatinine_mg_dl?.toString() ?? "");
      }

      setLoadingProfile(false);
    };

    loadProfile();
  }, [supabase, userId]);

  if (loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Cargando perfil...
      </div>
    );
  }

  /* =========================
     Submit
  ========================= */
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const row: HealthProfileRow = {
      user_id: userId,
      full_name: fullName || null,
      age: age ? parseInt(age) : null,
      sex: sex || null,
      total_cholesterol_mg_dl: totalChol
        ? parseFloat(totalChol)
        : null,
      hdl_mg_dl: hdl ? parseFloat(hdl) : null,
      ldl_mg_dl: ldl ? parseFloat(ldl) : null,
      triglycerides_mg_dl: triglycerides
        ? parseFloat(triglycerides)
        : null,
      fasting_glucose_mg_dl: fastingGlucose
        ? parseFloat(fastingGlucose)
        : null,
      creatinine_mg_dl: creatinine
        ? parseFloat(creatinine)
        : null,
    };

    const { error } = await supabase
      .from("health_profiles")
      .upsert(row, { onConflict: "user_id" });

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold mb-4">
          Mi Perfil de Salud
        </h2>

        {error && (
          <p className="text-red-600 mb-2">{error}</p>
        )}
        {success && (
          <p className="text-green-600 mb-2">
            Guardado con éxito
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nombre completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border p-2 rounded"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Edad"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="border p-2 rounded"
            />
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          <h3 className="font-bold pt-4">
            Valores de laboratorio
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              step="any"
              placeholder="Colesterol total"
              value={totalChol}
              onChange={(e) => setTotalChol(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="any"
              placeholder="HDL"
              value={hdl}
              onChange={(e) => setHdl(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="any"
              placeholder="LDL"
              value={ldl}
              onChange={(e) => setLdl(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="any"
              placeholder="Triglicéridos"
              value={triglycerides}
              onChange={(e) =>
                setTriglycerides(e.target.value)
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="any"
              placeholder="Glucosa en ayunas"
              value={fastingGlucose}
              onChange={(e) =>
                setFastingGlucose(e.target.value)
              }
              className="border p-2 rounded"
            />
            <input
              type="number"
              step="any"
              placeholder="Creatinina"
              value={creatinine}
              onChange={(e) =>
                setCreatinine(e.target.value)
              }
              className="border p-2 rounded"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white py-3 rounded-lg font-bold disabled:opacity-50"
          >
            {loading ? "Guardando..." : "Guardar Perfil"}
          </button>
        </form>
      </div>
    </div>
  );
}