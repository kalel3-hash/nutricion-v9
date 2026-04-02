"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase";

// Tipado para la base de datos
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

export default function PerfilSaludPage() {
  // Estados de datos
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [totalChol, setTotalChol] = useState("");
  const [hdl, setHdl] = useState("");
  const [ldl, setLdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [creatinine, setCreatinine] = useState("");

  // Estados de control
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Función robusta para obtener sesión
  const getValidSession = useCallback(async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      // Intento de refresco forzado si la sesión parece nula
      const { data: refreshData } = await supabase.auth.refreshSession();
      return refreshData.session;
    }
    return session;
  }, [supabase]);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error: fetchError } = await supabase
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
  }, [supabase]);

  useEffect(() => {
    const init = async () => {
      const session = await getValidSession();
      if (session) {
        setCurrentUserId(session.user.id);
        await fetchProfile(session.user.id);
      } else {
        setLoadingProfile(false);
      }
    };
    init();
  }, [getValidSession, fetchProfile]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrMessage(null);
    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/ocr-pdf", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error en OCR");

      const v = data.values;
      if (v.total_cholesterol_mg_dl) setTotalChol(v.total_cholesterol_mg_dl.toString());
      if (v.hdl_mg_dl) setHdl(v.hdl_mg_dl.toString());
      if (v.ldl_mg_dl) setLdl(v.ldl_mg_dl.toString());
      if (v.triglycerides_mg_dl) setTriglycerides(v.triglycerides_mg_dl.toString());
      if (v.fasting_glucose_mg_dl) setFastingGlucose(v.fasting_glucose_mg_dl.toString());
      if (v.creatinine_mg_dl) setCreatinine(v.creatinine_mg_dl.toString());

      setOcrMessage(`✓ Se extrajeron datos. Revisa y guarda.`);
    } catch (err) {
      setOcrMessage("Error al procesar el PDF.");
    } finally {
      setOcrLoading(false);
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Verificación de sesión de último minuto antes de guardar
    const session = await getValidSession();
    if (!session) {
      setError("Sesión expirada. Por favor reinicia sesión.");
      setLoading(false);
      return;
    }

    const row: HealthProfileRow = {
      user_id: session.user.id,
      full_name: fullName || null,
      age: age ? parseInt(age) : null,
      sex: sex || null,
      total_cholesterol_mg_dl: totalChol ? parseFloat(totalChol) : null,
      hdl_mg_dl: hdl ? parseFloat(hdl) : null,
      ldl_mg_dl: ldl ? parseFloat(ldl) : null,
      triglycerides_mg_dl: triglycerides ? parseFloat(triglycerides) : null,
      fasting_glucose_mg_dl: fastingGlucose ? parseFloat(fastingGlucose) : null,
      creatinine_mg_dl: creatinine ? parseFloat(creatinine) : null,
    };

    const { error: upsertError } = await supabase
      .from("health_profiles")
      .upsert(row, { onConflict: "user_id" });

    if (upsertError) {
      setError("Error al guardar: " + upsertError.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  if (loadingProfile) return <div className="p-10 text-center">Cargando perfil...</div>;

  if (!currentUserId) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 mb-4">No se detectó sesión activa.</p>
        <Link href="/login" className="bg-green-600 text-white px-4 py-2 rounded">Ir al Login</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-bold mb-4">Cargar PDF</h2>
          <input type="file" accept=".pdf" onChange={handlePdfUpload} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
          {ocrLoading && <p className="text-blue-500 mt-2">Analizando...</p>}
          {ocrMessage && <p className="text-green-600 mt-2">{ocrMessage}</p>}
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-4">
          <h2 className="text-lg font-bold border-b pb-2">Datos Personales</h2>
          {error && <p className="p-3 bg-red-50 text-red-600 rounded">{error}</p>}
          {success && <p className="p-3 bg-green-50 text-green-600 rounded">¡Guardado con éxito!</p>}
          
          <input type="text" placeholder="Nombre completo" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full border p-2 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <input type="number" placeholder="Edad" value={age} onChange={(e) => setAge(e.target.value)} className="border p-2 rounded" />
            <select value={sex} onChange={(e) => setSex(e.target.value)} className="border p-2 rounded">
              <option value="">Sexo</option>
              <option value="Masculino">Masculino</option>
              <option value="Femenino">Femenino</option>
            </select>
          </div>

          <h2 className="text-lg font-bold border-b pb-2 pt-4">Valores de Laboratorio</h2>
          <div className="grid grid-cols-2 gap-4">
            <input type="number" step="any" placeholder="Glucosa (mg/dl)" value={fastingGlucose} onChange={(e) => setFastingGlucose(e.target.value)} className="border p-2 rounded" />
            <input type="number" step="any" placeholder="Colest. Total" value={totalChol} onChange={(e) => setTotalChol(e.target.value)} className="border p-2 rounded" />
            <input type="number" step="any" placeholder="HDL" value={hdl} onChange={(e) => setHdl(e.target.value)} className="border p-2 rounded" />
            <input type="number" step="any" placeholder="LDL" value={ldl} onChange={(e) => setLdl(e.target.value)} className="border p-2 rounded" />
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-700 text-white font-bold py-3 rounded-lg hover:bg-green-800 disabled:opacity-50">
            {loading ? "Guardando..." : "ACTUALIZAR MI PERFIL"}
          </button>
        </form>
      </div>
    </div>
  );
}