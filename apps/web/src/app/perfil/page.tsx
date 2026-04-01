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
      // Usamos getSession para compatibilidad total con Google
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
      // REGLA CRÍTICA: getSession para evitar el error de 'Auth session missing'
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) throw new Error("Debes iniciar sesión para guardar.");

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

  if (loading) return <div className="p-8 text-center font-bold">Cargando perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-100 pb-12">
      <header className="bg-green-900 text-white p-4 flex justify-between items-center shadow-md mb-6">
        <h1 className="font-bold text-lg">VitalCross AI - Perfil</h1>
        <Link href="/dashboard" className="bg-green-700 px-4 py-2 rounded-lg text-sm">Volver</Link>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-xl font-black text-green-800 uppercase italic">Datos Personales</h2>
            <p className="text-gray-500 text-xs">Información básica para cálculos metabólicos</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo</label>
              <input 
                type="text" 
                className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Edad</label>
                <input 
                  type="number" 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Sexo</label>
                <select 
                  className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-green-500 outline-none"
                  value={profile.sex}
                  onChange={(e) => setProfile({...profile, sex: e.target.value})}
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-b pb-4 pt-4">
            <h2 className="text-xl font-black text-blue-800 uppercase italic">Valores Clínicos</h2>
            <p className="text-gray-500 text-xs">Datos de laboratorio para análisis de precisión</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Glucosa (mg/dl)", key: "fasting_glucose_mg_dl" },
              { label: "Colest. Total", key: "total_cholesterol_mg_dl" },
              { label: "HDL", key: "hdl_mg_dl" },
              { label: "LDL", key: "ldl_mg_dl" },
              { label: "Triglicéridos", key: "triglycerides_mg_dl" },
              { label: "HbA1c (%)", key: "hba1c_percent" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">{field.label}</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full border-2 border-gray-50 rounded-lg p-2 text-sm focus:border-blue-400 outline-none"
                  value={profile[field.key]}
                  onChange={(e) => setProfile({...profile, [field.key]: e.target.value})}
                />
              </div>
            ))}
          </div>

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-green-700 text-white py-4 rounded-xl font-black text-lg shadow-lg hover:bg-green-800 transition-all disabled:opacity-50"
          >
            {saving ? "GUARDANDO..." : "ACTUALIZAR MI PERFIL"}
          </button>

          {message && (
            <div className={`p-4 rounded-xl text-center font-bold text-sm ${message.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}
        </form>
      </main>
    </div>
  );
}