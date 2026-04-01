"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function PerfilPage() {
  const [profile, setProfile] = useState<any>({
    full_name: "", age: "", sex: "", weight_kg: "", height_cm: "",
    total_cholesterol_mg_dl: "", hdl_mg_dl: "", ldl_mg_dl: "",
    triglycerides_mg_dl: "", fasting_glucose_mg_dl: "", hba1c_percent: "",
    creatinine_mg_dl: "", urea_mg_dl: "", tsh_miu_l: "",
    conditions: [], medications: [], allergies: [], main_goal: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      // Patrón de sesión para Google OAuth
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const { data } = await supabase
          .from("health_profiles")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        if (data) setProfile(data);
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage("");
    
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const response = await fetch("/api/ocr-pdf", {
          method: "POST",
          body: JSON.stringify({ pdf: base64 }),
        });
        const data = await response.json();
        if (data.values) {
          setProfile({ ...profile, ...data.values });
          setMessage("✅ Se extrajeron los valores del PDF. Revisalos y guardá el perfil.");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setMessage("❌ Error al procesar el PDF");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      
      // FIX GOOGLE OAUTH: Refrescar sesión antes de guardar (Igual que en Analizar)
      let { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData.session;
      }

      if (!session) throw new Error("No se detectó una sesión activa. Por favor, reingresá.");

      const { error } = await supabase
        .from("health_profiles")
        .upsert({
          user_id: session.user.id,
          ...profile,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      setMessage("✅ Perfil guardado exitosamente");
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-green-800">Cargando VitalCross AI...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-lg">Mi perfil de salud</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded-xl text-sm font-bold">Volver</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6 space-y-6">
        
        {/* BLOQUE OCR: CARGAR PDF */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📄</span>
            <h2 className="text-green-900 font-bold">Cargar estudio clínico PDF</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6">Subí tu análisis de sangre y la IA extraerá los valores automáticamente.</p>
          
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-green-200 border-dashed rounded-3xl cursor-pointer bg-green-50/30 hover:bg-green-50 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <p className="text-sm text-green-700 font-medium">
                {isUploading ? "Analizando PDF..." : "📎 Seleccionar PDF del laboratorio"}
              </p>
            </div>
            <input type="file" className="hidden" accept="application/pdf" onChange={handleFileUpload} disabled={isUploading} />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h2 className="text-green-800 font-black italic uppercase text-lg mb-6 border-b border-gray-50 pb-2">
              SECCIÓN 1 — Datos personales
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-500 outline-none"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 md:col-span-2">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Edad</label>
                  <input 
                    type="number" 
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-500 outline-none"
                    value={profile.age || ""}
                    onChange={(e) => setProfile({...profile, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Sexo</label>
                  <select 
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-green-500 outline-none"
                    value={profile.sex || ""}
                    onChange={(e) => setProfile({...profile, sex: e.target.value})}
                  >
                    <option value="">Seleccionar</option>
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: VALORES DE LABORATORIO (Estilo image_e41b11) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h2 className="text-blue-800 font-black italic uppercase text-lg mb-2">VALORES DE LABORATORIO</h2>
            <p className="text-gray-400 text-xs mb-8">Ingresá tus últimos análisis clínicos</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: "GLUCOSA (MG/DL)", key: "fasting_glucose_mg_dl" },
                { label: "COLEST. TOTAL", key: "total_cholesterol_mg_dl" },
                { label: "HDL", key: "hdl_mg_dl" },
                { label: "LDL", key: "ldl_mg_dl" },
                { label: "TRIGLICÉRIDOS", key: "triglycerides_mg_dl" },
                { label: "CREATININA", key: "creatinine_mg_dl" },
              ].map((field) => (
                <div key={field.key} className="bg-white rounded-2xl border-2 border-gray-50 p-3 shadow-sm">
                  <label className="block text-[9px] font-black text-blue-600 mb-1">{field.label}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full bg-transparent font-bold text-gray-800 outline-none text-lg"
                    value={profile[field.key] || ""}
                    onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BOTÓN ACTUALIZAR */}
          <div className="space-y-4">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-green-700 text-white py-5 rounded-[2.5rem] font-black text-xl shadow-xl hover:bg-green-800 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "GUARDANDO..." : "ACTUALIZAR MI PERFIL"}
            </button>

            {message && (
              <div className={`p-4 rounded-2xl text-center font-bold text-sm border ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700 border-green-100' 
                  : 'bg-red-50 text-red-700 border-red-100'
              }`}>
                {message}
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}