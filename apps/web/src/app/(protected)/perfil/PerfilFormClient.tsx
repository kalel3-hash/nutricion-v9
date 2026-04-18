"use client";

import { useEffect, useState, useRef } from "react";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.7rem 1rem", borderRadius: "8px",
  border: "1.5px solid #B5D4F4", fontSize: "0.9rem", color: "#2C2C2A",
  background: "#F8FBFF", outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#5F5E5A",
  marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.4px",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1rem", fontWeight: 700, color: "#185FA5",
  margin: "0 0 1.25rem", paddingBottom: "0.5rem", borderBottom: "2px solid #E6F1FB",
};

const cardStyle: React.CSSProperties = {
  background: "#FFFFFF", borderRadius: "14px", border: "1px solid #B5D4F4",
  boxShadow: "0 2px 12px rgba(24,95,165,0.06)", padding: "1.75rem", marginBottom: "1.25rem",
};

const rowStyle: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem",
};

const GOALS = [
  { value: "bajar_peso",                    label: "Bajar de peso" },
  { value: "mantener_peso",                 label: "Mantener peso" },
  { value: "subir_peso",                    label: "Subir de peso" },
  { value: "reducir_grasa_corporal",        label: "Reducir grasa corporal" },
  { value: "aumentar_masa_muscular",        label: "Aumentar masa muscular" },
  { value: "controlar_glucemia",            label: "Controlar glucemia" },
  { value: "prevenir_diabetes",             label: "Prevenir diabetes" },
  { value: "mejorar_colesterol",            label: "Mejorar colesterol" },
  { value: "mejorar_trigliceridos",         label: "Mejorar triglicéridos" },
  { value: "reducir_riesgo_cardiovascular", label: "Reducir riesgo cardiovascular" },
  { value: "mejorar_presion",               label: "Mejorar presión arterial" },
  { value: "reducir_cansancio_fatiga",      label: "Reducir cansancio y fatiga" },
  { value: "mejorar_salud_intestinal",      label: "Mejorar salud intestinal" },
  { value: "reducir_inflamacion",           label: "Reducir inflamación" },
  { value: "alimentacion_saludable",        label: "Alimentación más saludable en general" },
];

const KNOWN_VALUES = GOALS.map(g => g.value);

export default function PerfilFormClient() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [cholesterol, setCholesterol] = useState("");
  const [hdl, setHdl] = useState("");
  const [ldl, setLdl] = useState("");
  const [triglycerides, setTriglycerides] = useState("");
  const [glucose, setGlucose] = useState("");
  const [hba1c, setHba1c] = useState("");
  const [creatinine, setCreatinine] = useState("");
  const [urea, setUrea] = useState("");
  const [tsh, setTsh] = useState("");
  const [conditions, setConditions] = useState("");
  const [medications, setMedications] = useState("");
  const [allergies, setAllergies] = useState("");
  const [mainGoals, setMainGoals] = useState<string[]>([]);
  const [otrosGoal, setOtrosGoal] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<{ type: "ok" | "error" | ""; msg: string }>({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrMsg, setOcrMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imc = (() => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h || h <= 0) return "";
    return (w / (h * h)).toFixed(1);
  })();

  const imcLabel = (() => {
    const v = parseFloat(imc);
    if (!v) return "";
    if (v < 18.5) return "Bajo peso";
    if (v < 25) return "Normal";
    if (v < 30) return "Sobrepeso";
    return "Obesidad";
  })();

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/profile");
      const json = await res.json();
      const p = json?.profile;
      if (!p) return;

      const parts = (p.full_name ?? "").split(" ");
      setNombre(parts[0] ?? "");
      setApellido(parts.slice(1).join(" ") ?? "");
      setAge((p.age ?? "").toString());
      setSex(p.sex ?? "");
      setWeight((p.weight_kg ?? "").toString());
      setHeight((p.height_cm ?? "").toString());
      setCholesterol((p.total_cholesterol_mg_dl ?? "").toString());
      setHdl((p.hdl_mg_dl ?? "").toString());
      setLdl((p.ldl_mg_dl ?? "").toString());
      setTriglycerides((p.triglycerides_mg_dl ?? "").toString());
      setGlucose((p.fasting_glucose_mg_dl ?? "").toString());
      setHba1c((p.hba1c_percent ?? "").toString());
      setCreatinine((p.creatinine_mg_dl ?? "").toString());
      setUrea((p.urea_mg_dl ?? "").toString());
      setTsh((p.tsh_miu_l ?? "").toString());
      setConditions((p.conditions ?? []).join(", "));
      setMedications((p.medications ?? []).join(", "));
      setAllergies((p.allergies ?? []).join(", "));

      const raw = p.main_goal ?? "";
      const rawArray: string[] = Array.isArray(raw)
        ? raw
        : typeof raw === "string" && raw.trim()
          ? raw.split(",").map((s: string) => s.trim()).filter(Boolean)
          : [];

      setMainGoals(rawArray.filter(g => KNOWN_VALUES.includes(g)));
      setOtrosGoal(rawArray.filter(g => !KNOWN_VALUES.includes(g)).join(", "));
      setNotes(p.notes ?? "");
    };
    load();
  }, []);

  const toggleGoal = (value: string) => {
    setMainGoals(prev =>
      prev.includes(value) ? prev.filter(g => g !== value) : [...prev, value]
    );
  };

  const handleOcr = async (file: File) => {
    setOcrLoading(true);
    setOcrMsg("Analizando el archivo con IA...");
    try {
      const formData = new FormData();
      formData.append("pdf", file);
      const res = await fetch("/api/ocr-pdf", { method: "POST", body: formData });
      const json = await res.json();
      if (json.error) { setOcrMsg(`Error: ${json.error}`); return; }
      const v = json.values ?? {};
      if (v.total_cholesterol_mg_dl != null) setCholesterol(v.total_cholesterol_mg_dl.toString());
      if (v.hdl_mg_dl != null) setHdl(v.hdl_mg_dl.toString());
      if (v.ldl_mg_dl != null) setLdl(v.ldl_mg_dl.toString());
      if (v.triglycerides_mg_dl != null) setTriglycerides(v.triglycerides_mg_dl.toString());
      if (v.fasting_glucose_mg_dl != null) setGlucose(v.fasting_glucose_mg_dl.toString());
      if (v.hba1c_percent != null) setHba1c(v.hba1c_percent.toString());
      if (v.creatinine_mg_dl != null) setCreatinine(v.creatinine_mg_dl.toString());
      if (v.urea_mg_dl != null) setUrea(v.urea_mg_dl.toString());
      if (v.tsh_miu_l != null) setTsh(v.tsh_miu_l.toString());
      setOcrMsg("✅ Datos extraídos correctamente. Revisalos y guardá el perfil.");
    } catch {
      setOcrMsg("Error al procesar el archivo.");
    } finally {
      setOcrLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleOcr(file);
  };

  const save = async () => {
    setLoading(true);
    setStatus({ type: "", msg: "" });
    try {
      const allGoals = [
        ...mainGoals,
        ...(otrosGoal.trim() ? [otrosGoal.trim()] : []),
      ];
      const body = {
        full_name: `${nombre.trim()} ${apellido.trim()}`.trim(),
        age: age ? parseInt(age) : null,
        sex: sex || null,
        weight_kg: weight ? parseFloat(weight) : null,
        height_cm: height ? parseFloat(height) : null,
        total_cholesterol_mg_dl: cholesterol ? parseFloat(cholesterol) : null,
        hdl_mg_dl: hdl ? parseFloat(hdl) : null,
        ldl_mg_dl: ldl ? parseFloat(ldl) : null,
        triglycerides_mg_dl: triglycerides ? parseFloat(triglycerides) : null,
        fasting_glucose_mg_dl: glucose ? parseFloat(glucose) : null,
        hba1c_percent: hba1c ? parseFloat(hba1c) : null,
        creatinine_mg_dl: creatinine ? parseFloat(creatinine) : null,
        urea_mg_dl: urea ? parseFloat(urea) : null,
        tsh_miu_l: tsh ? parseFloat(tsh) : null,
        conditions: conditions ? conditions.split(",").map(s => s.trim()).filter(Boolean) : [],
        medications: medications ? medications.split(",").map(s => s.trim()).filter(Boolean) : [],
        allergies: allergies ? allergies.split(",").map(s => s.trim()).filter(Boolean) : [],
        main_goal: allGoals.length > 0 ? allGoals.join(", ") : null,
        notes: notes || null,
      };

      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (json.ok) {
        setStatus({ type: "ok", msg: "Perfil guardado correctamente." });
      } else {
        setStatus({ type: "error", msg: json.error ?? "Error al guardar." });
      }
    } catch (e: any) {
      setStatus({ type: "error", msg: e?.message ?? "Error de red." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>

      {/* OCR */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Cargar estudios clínicos</h2>
        <p style={{ margin: "0 0 1.25rem", fontSize: "0.875rem", color: "#5F5E5A", lineHeight: 1.6 }}>
          Subí un PDF o una foto de tus análisis de laboratorio y la IA va a extraer los valores automáticamente.
        </p>
        <input ref={fileInputRef} type="file" accept="application/pdf,image/*"
          style={{ display: "none" }} onChange={handleFileChange} />
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={ocrLoading} style={{
          display: "flex", alignItems: "center", gap: "8px",
          padding: "0.75rem 1.5rem", borderRadius: "8px",
          background: ocrLoading ? "#E6F1FB" : "#185FA5",
          color: ocrLoading ? "#378ADD" : "#FFFFFF",
          border: "none", fontSize: "0.9rem", fontWeight: 600,
          cursor: ocrLoading ? "not-allowed" : "pointer",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {ocrLoading ? "Procesando..." : "Subir PDF o foto de estudios"}
        </button>
        {ocrMsg && (
          <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: ocrMsg.startsWith("✅") ? "#27500A" : "#991B1B" }}>
            {ocrMsg}
          </p>
        )}
      </div>

      {/* Datos básicos */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Datos básicos</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Nombre</label>
              <input style={inputStyle} value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan" />
            </div>
            <div>
              <label style={labelStyle}>Apellido</label>
              <input style={inputStyle} value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Ej: García" />
            </div>
          </div>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Edad</label>
              <input style={inputStyle} type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Ej: 45" min="1" max="120" />
            </div>
            <div>
              <label style={labelStyle}>Sexo</label>
              <select style={inputStyle} value={sex} onChange={e => setSex(e.target.value)}>
                <option value="">Seleccionar</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Peso (kg)</label>
              <input style={inputStyle} type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Ej: 75" step="0.1" />
            </div>
            <div>
              <label style={labelStyle}>Altura (cm)</label>
              <input style={inputStyle} type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="Ej: 170" />
            </div>
          </div>
          <div>
            <label style={labelStyle}>IMC — Índice de masa corporal</label>
            <div style={{
              ...inputStyle, background: imc ? "#E6F1FB" : "#F8FBFF",
              color: imc ? "#185FA5" : "#888780", fontWeight: imc ? 600 : 400,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span>{imc ? `${imc} kg/m²` : "Se calcula con peso y altura"}</span>
              {imcLabel && (
                <span style={{ fontSize: "0.78rem", background: "#185FA5", color: "#fff", padding: "2px 10px", borderRadius: "20px", fontWeight: 600 }}>
                  {imcLabel}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Datos clínicos */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Datos clínicos</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontSize: "0.8rem", color: "#888780" }}>Perfil lipídico (mg/dL)</p>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Colesterol total</label>
              <input style={inputStyle} type="number" value={cholesterol} onChange={e => setCholesterol(e.target.value)} placeholder="Ej: 190" step="0.1" />
            </div>
            <div>
              <label style={labelStyle}>HDL (colesterol bueno)</label>
              <input style={inputStyle} type="number" value={hdl} onChange={e => setHdl(e.target.value)} placeholder="Ej: 55" step="0.1" />
            </div>
          </div>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>LDL (colesterol malo)</label>
              <input style={inputStyle} type="number" value={ldl} onChange={e => setLdl(e.target.value)} placeholder="Ej: 110" step="0.1" />
            </div>
            <div>
              <label style={labelStyle}>Triglicéridos</label>
              <input style={inputStyle} type="number" value={triglycerides} onChange={e => setTriglycerides(e.target.value)} placeholder="Ej: 150" step="0.1" />
            </div>
          </div>
          <p style={{ margin: "0.5rem 0 0.5rem", fontSize: "0.8rem", color: "#888780" }}>Glucemia</p>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Glucemia en ayunas (mg/dL)</label>
              <input style={inputStyle} type="number" value={glucose} onChange={e => setGlucose(e.target.value)} placeholder="Ej: 95" step="0.1" />
            </div>
            <div>
              <label style={labelStyle}>HbA1c (%)</label>
              <input style={inputStyle} type="number" value={hba1c} onChange={e => setHba1c(e.target.value)} placeholder="Ej: 5.4" step="0.1" />
            </div>
          </div>
          <p style={{ margin: "0.5rem 0 0.5rem", fontSize: "0.8rem", color: "#888780" }}>Función renal</p>
          <div style={rowStyle}>
            <div>
              <label style={labelStyle}>Creatinina (mg/dL)</label>
              <input style={inputStyle} type="number" value={creatinine} onChange={e => setCreatinine(e.target.value)} placeholder="Ej: 0.9" step="0.01" />
            </div>
            <div>
              <label style={labelStyle}>Urea (mg/dL)</label>
              <input style={inputStyle} type="number" value={urea} onChange={e => setUrea(e.target.value)} placeholder="Ej: 30" step="0.1" />
            </div>
          </div>
          <p style={{ margin: "0.5rem 0 0.5rem", fontSize: "0.8rem", color: "#888780" }}>Tiroides</p>
          <div>
            <label style={labelStyle}>TSH (mUI/L)</label>
            <input style={{ ...inputStyle, maxWidth: "50%" }} type="number" value={tsh} onChange={e => setTsh(e.target.value)} placeholder="Ej: 2.1" step="0.01" />
          </div>
        </div>
      </div>

      {/* Condiciones, medicación y objetivos */}
      <div style={cardStyle}>
        <h2 style={sectionTitleStyle}>Condiciones, medicación y objetivos</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={labelStyle}>Condiciones de salud</label>
            <input style={inputStyle} value={conditions} onChange={e => setConditions(e.target.value)}
              placeholder="Ej: diabetes tipo 2, hipertensión (separadas por coma)" />
          </div>
          <div>
            <label style={labelStyle}>Medicamentos</label>
            <input style={inputStyle} value={medications} onChange={e => setMedications(e.target.value)}
              placeholder="Ej: metformina, losartán (separados por coma)" />
          </div>
          <div>
            <label style={labelStyle}>Alergias alimentarias</label>
            <input style={inputStyle} value={allergies} onChange={e => setAllergies(e.target.value)}
              placeholder="Ej: maní, gluten (separadas por coma)" />
          </div>

          {/* Objetivos — checkboxes */}
          <div>
            <label style={labelStyle}>Objetivos principales</label>
            <p style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", color: "#888780" }}>
              Podés elegir uno o varios.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              {GOALS.map((goal) => {
                const checked = mainGoals.includes(goal.value);
                return (
                  <label
                    key={goal.value}
                    onClick={() => toggleGoal(goal.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: "12px",
                      padding: "0.7rem 1rem", borderRadius: "8px", cursor: "pointer",
                      border: `1.5px solid ${checked ? "#185FA5" : "#B5D4F4"}`,
                      background: checked ? "#E6F1FB" : "#F8FBFF",
                      transition: "all 0.15s", userSelect: "none",
                    }}
                  >
                    <div style={{
                      width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
                      border: `2px solid ${checked ? "#185FA5" : "#B5D4F4"}`,
                      background: checked ? "#185FA5" : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {checked && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: "0.88rem", color: checked ? "#0C447C" : "#2C2C2A", fontWeight: checked ? 600 : 400 }}>
                      {goal.label}
                    </span>
                  </label>
                );
              })}

              {/* Otros — campo libre */}
              <label style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "0.7rem 1rem", borderRadius: "8px",
                border: `1.5px solid ${otrosGoal.trim() ? "#185FA5" : "#B5D4F4"}`,
                background: otrosGoal.trim() ? "#E6F1FB" : "#F8FBFF",
                transition: "all 0.15s",
              }}>
                <div style={{
                  width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
                  border: `2px solid ${otrosGoal.trim() ? "#185FA5" : "#B5D4F4"}`,
                  background: otrosGoal.trim() ? "#185FA5" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {otrosGoal.trim() && (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <input
                  type="text"
                  value={otrosGoal}
                  onChange={e => setOtrosGoal(e.target.value)}
                  placeholder="Otros objetivos (escribí acá...)"
                  style={{
                    border: "none", background: "transparent", outline: "none",
                    fontSize: "0.88rem", color: "#2C2C2A", width: "100%",
                  }}
                />
              </label>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Notas adicionales</label>
            <textarea
              style={{ ...inputStyle, height: "80px", resize: "vertical" }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Cualquier dato adicional que la IA deba tener en cuenta..."
            />
          </div>
        </div>
      </div>

      {/* Estado y botón */}
      {status.msg && (
        <div style={{
          padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1rem",
          fontSize: "0.875rem",
          background: status.type === "ok" ? "#EAF3DE" : "#FEE2E2",
          color: status.type === "ok" ? "#27500A" : "#991B1B",
          border: `1px solid ${status.type === "ok" ? "#C0DD97" : "#FECACA"}`,
        }}>
          {status.msg}
        </div>
      )}

      <button onClick={save} disabled={loading} style={{
        width: "100%", padding: "0.9rem", borderRadius: "10px",
        background: "#185FA5", color: "#FFFFFF", fontSize: "1rem",
        fontWeight: 600, border: "none",
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.7 : 1, marginBottom: "2rem",
      }}>
        {loading ? "Guardando..." : "Guardar perfil"}
      </button>

    </div>
  );
}