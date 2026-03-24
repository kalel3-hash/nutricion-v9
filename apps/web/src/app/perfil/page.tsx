"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase";

const MAIN_GOALS = [
  "Bajar de peso",
  "Controlar glucemia",
  "Reducir colesterol",
  "Ganar músculo",
  "Mejorar salud general",
] as const;

function splitToArray(text: string): string[] {
  return text
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
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

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const supabase = createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setLoading(false);
      setError(userError.message);
      return;
    }

    if (!user) {
      setLoading(false);
      setError("No hay sesión activa. Iniciá sesión nuevamente.");
      return;
    }

    const row: HealthProfileRow = {
      user_id: user.id,
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
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-900 px-4 py-4 shadow-md sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            Mi perfil de salud
          </h1>
          <Link
            href="/dashboard"
            className="shrink-0 rounded-lg border border-green-700 bg-green-800 px-3 py-1.5 text-sm font-semibold text-green-50 transition-colors hover:bg-green-700"
          >
            Volver
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[600px] px-4 py-8 sm:px-6">
        <form
          onSubmit={handleSubmit}
          className="space-y-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200/80 sm:p-8"
        >
          {success ? (
            <p className="rounded-xl bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-800">
              ✓ Perfil guardado correctamente
            </p>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <section className="space-y-4">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-green-900">
              SECCIÓN 1 — Datos personales
            </h2>

            <div className="space-y-1.5">
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-800"
              >
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="age" className="block text-sm font-medium text-gray-800">
                Edad
              </label>
              <input
                id="age"
                type="number"
                min={0}
                max={130}
                step={1}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="sex" className="block text-sm font-medium text-gray-800">
                Sexo
              </label>
              <select
                id="sex"
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              >
                <option value="">Seleccionar…</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="weightKg"
                className="block text-sm font-medium text-gray-800"
              >
                Peso en kg
              </label>
              <input
                id="weightKg"
                type="number"
                min={0}
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="heightCm"
                className="block text-sm font-medium text-gray-800"
              >
                Altura en cm
              </label>
              <input
                id="heightCm"
                type="number"
                min={0}
                step="0.1"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-green-900">
              SECCIÓN 2 — Marcadores clínicos
            </h2>

            {(
              [
                ["totalChol", "Colesterol total mg/dL", totalChol, setTotalChol],
                ["hdl", "Colesterol HDL mg/dL", hdl, setHdl],
                ["ldl", "Colesterol LDL mg/dL", ldl, setLdl],
                ["triglycerides", "Triglicéridos mg/dL", triglycerides, setTriglycerides],
                ["fastingGlucose", "Glucemia en ayunas mg/dL", fastingGlucose, setFastingGlucose],
                ["hba1c", "Hemoglobina glicosilada HbA1c %", hba1c, setHba1c],
                ["creatinine", "Creatinina mg/dL", creatinine, setCreatinine],
                ["urea", "Urea mg/dL", urea, setUrea],
                ["tsh", "TSH mUI/L", tsh, setTsh],
              ] as const
            ).map(([id, label, val, setVal]) => (
              <div key={id} className="space-y-1.5">
                <label
                  htmlFor={id}
                  className="block text-sm font-medium text-gray-800"
                >
                  {label}
                </label>
                <input
                  id={id}
                  type="number"
                  min={0}
                  step="any"
                  value={val}
                  onChange={(e) => setVal(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                />
              </div>
            ))}
          </section>

          <section className="space-y-4">
            <h2 className="border-b border-gray-200 pb-2 text-base font-semibold text-green-900">
              SECCIÓN 3 — Condiciones y objetivos
            </h2>

            <div className="space-y-1.5">
              <label
                htmlFor="conditions"
                className="block text-sm font-medium text-gray-800"
              >
                Condiciones diagnosticadas
              </label>
              <textarea
                id="conditions"
                rows={3}
                value={conditionsText}
                onChange={(e) => setConditionsText(e.target.value)}
                placeholder="Ej: Diabetes tipo 2, Hipotiroidismo"
                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="medications"
                className="block text-sm font-medium text-gray-800"
              >
                Medicamentos actuales
              </label>
              <textarea
                id="medications"
                rows={3}
                value={medicationsText}
                onChange={(e) => setMedicationsText(e.target.value)}
                placeholder="Ej: Metformina 500mg, Levotiroxina 50mcg"
                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="allergies"
                className="block text-sm font-medium text-gray-800"
              >
                Alergias e intolerancias
              </label>
              <textarea
                id="allergies"
                rows={3}
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="Ej: Gluten, Lactosa, Mariscos"
                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="mainGoal"
                className="block text-sm font-medium text-gray-800"
              >
                Objetivo principal
              </label>
              <select
                id="mainGoal"
                value={mainGoal}
                onChange={(e) => setMainGoal(e.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none transition-shadow focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
              >
                <option value="">Seleccionar…</option>
                {MAIN_GOALS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-2xl bg-green-600 px-6 py-4 text-lg font-semibold text-white shadow-sm transition-colors hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Guardando…" : "Guardar perfil"}
          </button>
        </form>
      </main>
    </div>
  );
}
