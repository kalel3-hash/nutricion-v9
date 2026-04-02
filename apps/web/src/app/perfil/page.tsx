"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase";

const MAIN_GOALS = [
  "Bajar de peso",
  "Controlar glucemia",
  "Reducir colesterol",
  "Ganar músculo",
  "Mejorar salud general",
] as const;

function splitToArray(text: string): string[] {
  return text.split(",").map((s) => s.trim()).filter(Boolean);
}

function parseOptionalInt(value: string): number | null {
  const t = value.trim();
  if (t === "") return null;
  const n = parseInt(t, 10);
  return Number.isFinite(n) ? n : null;
}

function parseOptionalFloat(value: string): number | null {
  const t = value.trim().replace(",", ".");
  if (t === "") return null;
  const n = parseFloat(t);
  return Number.isFinite(n) ? n : null;
}

type HealthProfileRow = {
  user_id: string;
  full_name: string | null;
  age: number | null;
  sex: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  total_cholesterol_mg_dl: number | null;
  hdl_mg_dl: number | null;
  ldl_mg_dl: number | null;
  triglycerides_mg_dl: number | null;
  fasting_glucose_mg_dl: number | null;
  hba1c_percent: number | null;
  creatinine_mg_dl: number | null;
  urea_mg_dl: number | null;
  tsh_miu_l: number | null;
  conditions: string[];
  medications: string[];
  allergies: string[];
  main_goal: string | null;
};

export default function PerfilSaludPage() {
  // ESTADOS DE DATOS
  const [fullName, setFullName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [totalChol, setTotalChol] = useState("");
  const [hdl, setHdl] = useState("");
  const [ldl, setLdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");
  const [fastingGlucose, setFastingGlucose] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [urea, setUrea] = useState("");
  const [tsh, setTsh] = useState("");
  const [conditionsText, setConditionsText] = useState("");
  const [medicationsText, setMedicationsText] = useState("");
  const [allergiesText, setAllergiesText] = useState("");
  const [mainGoal, setMainGoal] = useState<string>("");

  // ESTADOS DE CONTROL
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Función para cargar datos desde la DB
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
      setWeightKg(data.weight_kg?.toString() ?? "");
      setHeightCm(data.height_cm?.toString() ?? "");
      setTotalChol(data.total_cholesterol_mg_dl?.toString() ?? "");
      setHdl(data.hdl_mg_dl?.toString() ?? "");
      setLdl(data.ldl_mg_dl?.toString() ?? "");
      setTriglycerides(data.triglycerides_mg_dl?.toString() ?? "");
      setFastingGlucose(data.fasting_glucose_mg_dl?.toString() ?? "");
      setHba1c(data.hba1c_percent?.toString() ?? "");
      setCreatinine(data.creatinine_mg_dl?.toString() ?? "");
      setUrea(data.urea_mg_dl?.toString() ?? "");
      setTsh(data.tsh_miu_l?.toString() ?? "");
      setConditionsText((data.conditions ?? []).join(", "));
      setMedicationsText((data.medications ?? []).join(", "));
      setAllergiesText((data.allergies ?? []).join(", "));
      setMainGoal(data.main_goal ?? "");
    }
    setLoadingProfile(false);
  }, [supabase]);

  // Manejo de autenticación robusto
  useEffect(() => {
    const initAuth = async () => {
      // 1. Intentamos refrescar la sesión activamente
      const { data: { session } } = await supabase.auth.refreshSession();
      
      if (session) {
        setCurrentUserId(session.user.id);
        await fetchProfile(session.user.id);
      } else {
        // 2. Si falla el refresh, probamos getSession normal
        const { data: { session: fallback } } = await supabase.auth.getSession();
        if (fallback) {
          setCurrentUserId(fallback.user.id);
          await fetchProfile(fallback.user.id);
        } else {
          setLoadingProfile(false);
        }
      }
    };

    // Escuchar cambios de estado (por si loguea en otra pestaña o expira)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setCurrentUserId(session.user.id);
        if (event === 'SIGNED_IN') fetchProfile(session.user.id);
      } else {
        setCurrentUserId(null);
      }
    });

    initAuth();
    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setOcrMessage(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const response = await fetch("/api/ocr-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error procesando el PDF");

      const v = data.values;
      if (v.total_cholesterol_mg_dl !== null) setTotalChol(v.total_cholesterol_mg_dl.toString());
      if (v.hdl_mg_dl !== null) setHdl(v.hdl_mg_dl.toString());
      if (v.ldl_mg_dl !== null) setLdl(v.ldl_mg_dl.toString());
      if (v.triglycerides_mg_dl !== null) setTriglycerides(v.triglycerides_mg_dl.toString());
      if (v.fasting_glucose_mg_dl !== null) setFastingGlucose(v.fasting_glucose_mg_dl.toString());
      if (v.hba1c_percent !== null) setHba1c(v.hba1c_percent.toString());
      if (v.creatinine_mg_dl !== null) setCreatinine(v.creatinine_mg_dl.toString());
      if (v.urea_mg_dl !== null) setUrea(v.urea_mg_dl.toString());
      if (v.tsh_miu_l !== null) setTsh(v.tsh_miu_l.toString());

      const extracted = Object.values(v).filter(val => val !== null).length;
      setOcrMessage(`✓ Se extrajeron ${extracted} valores del PDF.`);
    } catch (err) {
      setOcrMessage(`Error: ${err instanceof Error ? err.message : "Error desconocido"}`);
    } finally {
      setOcrLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    // Verificación de seguridad antes de guardar
    let userId = currentUserId;
    if (!userId) {
      const { data: { session } } = await supabase.auth.getSession();
      userId = session?.user.id || null;
    }

    if (!userId) {
      setLoading(false);
      setError("No se detectó sesión de Google. Por favor, recargá la página o reingresá.");
      return;
    }

    const row: HealthProfileRow = {
      user_id: userId,
      full_name: fullName.trim() || null,
      age: parseOptionalInt(age),
      sex: sex || null,
      weight_kg: parseOptionalFloat(weightKg),
      height_cm: parseOptionalFloat(heightCm),
      total_cholesterol_mg_dl: parseOptionalFloat(totalChol),
      hdl_mg_dl: parseOptionalFloat(hdl),
      ldl_mg_dl: parseOptionalFloat(ldl),
      triglycerides_mg_dl: parseOptionalFloat(triglycerides),
      fasting_glucose_mg_dl: parseOptionalFloat(fastingGlucose),
      hba1c_percent: parseOptionalFloat(hba1c),
      creatinine_mg_dl: parseOptionalFloat(creatinine),
      urea_mg_dl: parseOptionalFloat(urea),
      tsh_miu_l: parseOptionalFloat(tsh),
      conditions: splitToArray(conditionsText),
      medications: splitToArray(medicationsText),
      allergies: splitToArray(allergiesText),
      main_goal: mainGoal || null,
    };

    const { error: upsertError } = await supabase
      .from("health_profiles")
      .upsert(row, { onConflict: "user_id" });

    setLoading(false);
    if (upsertError) {
      setError(upsertError.message);
      return;
    }
    setSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Sincronizando sesión...</p>
        </div>
      </div>
    );
  }

  // Pantalla de error si no hay sesión después de cargar
  if (!currentUserId && !loadingProfile) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center ring-1 ring-gray-200">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No logramos detectar tu sesión</h2>
          <p className="text-gray-500 mb-6">Necesitás estar identificado con Google para ver o editar tu perfil.</p>
          <Link href="/login" className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-colors">
            Ir al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 px-4 py-4 shadow-md sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">Mi perfil de salud</h1>
          <Link href="/dashboard" className="shrink-0 rounded-lg border border-green-700 bg-green-800 px-3 py-1.5 text-sm font-semibold text-green-50 transition-colors hover:bg-green-700">
            Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[600px] px-4 py-8 sm:px-6">
        {/* PDF UPLOAD SECTION */}
        <div className="mb-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/80">
          <h2 className="text-base font-semibold text-green-900 mb-2">📄 Cargar estudio clínico PDF</h2>
          <p className="text-sm text-gray-500 mb-4">Extraé los valores de tu análisis de sangre automáticamente.</p>
          <input ref={fileInputRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" id="pdf-upload" />
          <label htmlFor="pdf-upload" className={`flex items-center justify-center gap-2 w-full rounded-xl border-2 border-dashed px-4 py-4 cursor-pointer transition-colors ${ocrLoading ? "border-gray-200 bg-gray-50 text-gray-400" : "border-green-300 hover:border-green-500 hover:bg-green-50 text-green-700"}`}>
            {ocrLoading ? "⏳ Procesando..." : "📎 Seleccionar PDF"}
          </label>
          {ocrMessage && (
            <p className={`mt-3 text-sm rounded-lg px-3 py-2 ${ocrMessage.startsWith("Error") ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"}`}>
              {ocrMessage}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/80 sm:p-8">
          {success && <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-800">✓ Perfil guardado correctamente</p>}
          {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">{error}</p>}

          <section className="space-y-4">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-green-900">SECCIÓN 1 — Datos personales</h2>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-800">Nombre completo</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-green-600/20 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-800">Edad</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-green-600/20 outline-none" />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-gray-800">Sexo</label>
                <select value={sex} onChange={(e) => setSex(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-green-600/20 outline-none">
                  <option value="">Seleccionar</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-green-900">SECCIÓN 2 — Marcadores clínicos</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                ["totalChol", "Colesterol total", totalChol, setTotalChol],
                ["hdl", "HDL", hdl, setHdl],
                ["ldl", "LDL", ldl, setLdl],
                ["triglycerides", "Triglicéridos", triglycerides, setTriglycerides],
                ["fastingGlucose", "Glucemia", fastingGlucose, setFastingGlucose],
                ["hba1c", "HbA1c %", hba1c, setHba1c],
              ].map(([id, label, val, setVal]) => (
                <div key={id} className="space-y-1.5">
                  <label className="block text-sm font-medium text-gray-800">{label}</label>
                  <input type="number" step="any" value={val as string} onChange={(e) => (setVal as any)(e.target.value)} className="w-full rounded-xl border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-green-600/20 outline-none" />
                </div>
              ))}
            </div>
          </section>

          <button type="submit" disabled={loading} className="w-full rounded-2xl bg-green-600 py-4 text-lg font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-all">
            {loading ? "Guardando..." : "Actualizar mi perfil"}
          </button>
        </form>
      </main>
    </div>
  );
}