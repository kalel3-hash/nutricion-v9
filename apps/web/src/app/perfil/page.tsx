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
      
      // FIX CRÍTICO: Sincronización de sesión para Google OAuth
      let { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const { data: refreshData } = await supabase.auth.refreshSession();
        session = refreshData.session;
      }

      if (!session) throw new Error("Sesión no detectada. Por favor, reingresá.");

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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700 mx-auto mb-4"></div>
        <p className="text-green-800 font-bold">Cargando perfil médico...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 text-white px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold italic tracking-tighter">VitalCross AI — Mi Perfil</h1>
        <Link href="/dashboard" className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg font-bold transition-all">Volver</Link>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          
          {/* SECCIÓN 1: DATOS PERSONALES */}
          <div className="p-8 border-b border-gray-50">
            <h2 className="text-2xl font-black text-green-800 uppercase italic mb-6">Sección 1 — Datos personales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-green-500 outline-none transition-all"
                  value={profile.full_name || ""}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Edad</label>
                <input 
                  type="number" 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-green-500 outline-none"
                  value={profile.age || ""}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Sexo</label>
                <select 
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl p-4 focus:border-green-500 outline-none"
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

          {/* SECCIÓN 2: VALORES CLÍNICOS */}
          <div className="p-8 bg-blue-50/30">
            <h2 className="text-2xl font-black text-blue-800 uppercase italic mb-6">Valores de Laboratorio</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Glucosa (mg/dl)", key: "fasting_glucose_mg_dl" },
                { label: "Colest. Total", key: "total_cholesterol_mg_dl" },
                { label: "HDL", key: "hdl_mg_dl" },
                { label: "LDL", key: "ldl_mg_dl" },
                { label: "Triglicéridos", key: "triglycerides_mg_dl" },
                { label: "Creatinina", key: "creatinine_mg_dl" },
              ].map((field) => (
                <div key={field.key} className="bg-white p-3 rounded-2xl border border-blue-100 shadow-sm">
                  <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1">{field.label}</label>
                  <input 
                    type="number" 
                    step="0.01"
                    className="w-full text-gray-700 font-bold outline-none"
                    value={profile[field.key] || ""}
                    onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* BOTÓN Y MENSAJES */}
          <div className="p-8 bg-white text-center">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 mb-4"
            >
              {saving ? "GUARDANDO DATOS..." : "ACTUALIZAR MI PERFIL"}
            </button>

            {message && (
              <div className={`p-4 rounded-2xl font-bold text-sm ${message.includes('✅') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}