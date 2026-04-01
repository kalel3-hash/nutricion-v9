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
      
      // REGLA ORO GOOGLE: Obtener y refrescar sesión antes de cualquier escritura
      let { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Intentamos un refresco automático si la sesión parece expirada
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

  if (loading) return <div className="p-10 text-center font-bold text-green-800">Cargando datos clínicos...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-12 font-sans">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-lg">
        <h1 className="font-bold text-lg">VitalCross AI — Perfil</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded-xl text-sm font-bold">Volver</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* TARJETA 1: DATOS PERSONALES */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h2 className="text-green-800 font-black italic uppercase text-xl mb-6">SECCIÓN 1 — Datos personales</h2>
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

          {/* TARJETA 2: VALORES CLÍNICOS (El diseño que te gusta) */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <h2 className="text-blue-800 font-black italic uppercase text-xl mb-2">VALORES DE LABORATORIO</h2>
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

          {/* ACCIÓN Y ERROR */}
          <div className="space-y-4 pt-4">
            <button 
              type="submit" 
              disabled={saving}
              className="w-full bg-green-700 text-white py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-green-800 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {saving ? "GUARDANDO..." : "ACTUALIZAR MI PERFIL"}
            </button>

            {message && (
              <div className={`p-4 rounded-2xl text-center font-bold text-sm border ${message.includes('✅') ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                {message}
              </div>
            )}
          </div>

        </form>
      </main>
    </div>
  );
}