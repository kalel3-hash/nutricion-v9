/**
 * Elimina campos null, undefined, arrays vacíos y strings vacíos
 */
export function compactProfile(
  profile: Record<string, unknown>
): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(profile).filter(([_, v]) => {
      if (v === null || v === undefined) return false;
      if (typeof v === "string" && v.trim() === "") return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    })
  );
}

/**
 * Convierte el perfil clinico a texto legible para el prompt de medicamentos
 */
export function profileToText(profile: Record<string, unknown>): string {
  const lines: string[] = [];

  if (profile.full_name) lines.push("Paciente: " + profile.full_name);
  if (profile.age) lines.push("Edad: " + profile.age + " anos");
  if (profile.sex) lines.push("Sexo: " + profile.sex);
  if (profile.weight_kg && profile.height_cm) {
    const imc = (Number(profile.weight_kg) / Math.pow(Number(profile.height_cm) / 100, 2)).toFixed(1);
    lines.push("Peso: " + profile.weight_kg + " kg | Altura: " + profile.height_cm + " cm | IMC: " + imc);
  }

  const lipidos: string[] = [];
  if (profile.total_cholesterol_mg_dl) lipidos.push("Colesterol total: " + profile.total_cholesterol_mg_dl + " mg/dL");
  if (profile.hdl_mg_dl) lipidos.push("HDL: " + profile.hdl_mg_dl + " mg/dL");
  if (profile.ldl_mg_dl) lipidos.push("LDL: " + profile.ldl_mg_dl + " mg/dL");
  if (profile.triglycerides_mg_dl) lipidos.push("Trigliceridos: " + profile.triglycerides_mg_dl + " mg/dL");
  if (lipidos.length > 0) lines.push("Perfil lipidico - " + lipidos.join(" | "));

  const glucemia: string[] = [];
  if (profile.fasting_glucose_mg_dl) glucemia.push("Glucemia en ayunas: " + profile.fasting_glucose_mg_dl + " mg/dL");
  if (profile.hba1c_percent) glucemia.push("HbA1c: " + profile.hba1c_percent + "%");
  if (glucemia.length > 0) lines.push("Glucemia - " + glucemia.join(" | "));

  const renal: string[] = [];
  if (profile.creatinine_mg_dl) renal.push("Creatinina: " + profile.creatinine_mg_dl + " mg/dL");
  if (profile.urea_mg_dl) renal.push("Urea: " + profile.urea_mg_dl + " mg/dL");
  if (renal.length > 0) lines.push("Funcion renal - " + renal.join(" | "));

  if (profile.tsh_miu_l) lines.push("Tiroides - TSH: " + profile.tsh_miu_l + " mUI/L");

  if (Array.isArray(profile.conditions) && profile.conditions.length > 0)
    lines.push("Condiciones preexistentes: " + profile.conditions.join(", "));

  if (Array.isArray(profile.medications) && profile.medications.length > 0)
    lines.push("Medicacion actual: " + profile.medications.join(", "));

  if (Array.isArray(profile.allergies) && profile.allergies.length > 0)
    lines.push("Alergias: " + profile.allergies.join(", "));

  if (profile.main_goal) lines.push("Objetivos de salud: " + profile.main_goal);
  if (profile.notes) lines.push("Notas adicionales: " + profile.notes);

  return lines.length > 0 ? lines.join("\n") : "Sin datos clinicos cargados";
}