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
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient();
      // Verificación de sesión inicial compatible con Google OAuth
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      
      // PASO CRÍTICO: Reemplazo de getUser() por getSession() + Refresh
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
      console.error("Error al guardar:", err);
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-green-800 font-bold animate-pulse">Cargando tus datos clínicos...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-md mb-6">
        <h1 className="font-bold text-lg tracking-tight text-white">VitalCross AI — Perfil</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-600 transition-colors">Volver</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-6 border border-gray-100">
          <div className="border-b border-gray-100 pb-4">
            <h2 className="text-xl font-black text-green-800 uppercase italic tracking-wide">Datos Personales</h2>
            <p className="text-gray-400 text-xs mt-1 font-medium">Información esencial para el análisis nutricional</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Nombre Completo</label>
              <input 
                type="text" 
                className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-green-500 outline-none transition-all text-gray-700"
                value={profile.full_name || ""}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Edad</label>
              <input 
                type="number" 
                className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-green-500 outline-none transition-all text-gray-700"
                value={profile.age || ""}
                onChange={(e) => setProfile({...profile, age: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">Sexo</label>
              <select 
                className="w-full border-2 border-gray-50 rounded-xl p-3 focus:border-green-500 outline-none transition-all text-gray-700"
                value={profile.sex || ""}
                onChange={(e) => setProfile({...profile, sex: e.target.value})}
              >
                <option value="">Seleccionar</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>
          </div>

          <div className="border-b border-gray-100 pb-4 pt-4">
            <h2 className="text-xl font-black text-blue-800 uppercase italic tracking-wide">Valores de Laboratorio</h2>
            <p className="text-gray-400 text-xs mt-1 font-medium">Ingresá tus últimos análisis clínicos</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Glucosa (mg/dl)", key: "fasting_glucose_mg_dl" },
              { label: "Colest. Total", key: "total_cholesterol_mg_dl" },
              { label: "HDL", key: "hdl_mg_dl" },
              { label: "LDL", key: "ldl_mg_dl" },
              { label: "Triglicéridos", key: "triglycerides_mg_dl" },
              { label: "Creatinina", key: "creatinine_mg_dl" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-[9px] font-black text-gray-400 uppercase mb-1 tracking-tighter">{field.label}</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border-2 border-gray-50 rounded-lg p-2 text-sm focus:border-blue-400 outline-none transition-all"
                  value={profile[field.key] || ""}
                  onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                />
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-green-700 text-white py-5 rounded-2xl font-black text-xl shadow-xl hover:bg-green-800 disabled:opacity-50 transition-all transform active:scale-95"
            >
              {saving ? "PROCESANDO..." : "ACTUALIZAR MI PERFIL"}
            </button>
          </div>

          {message && (
            <div className={`p-4 rounded-xl text-center font-bold text-sm animate-bounce ${message.includes('✅') ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
              {message}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}