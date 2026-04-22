import Link from "next/link";
import Image from "next/image";

const sections = [
  { n: "1", title: "Principios generales", content: "VitalCross AI se compromete a proteger la privacidad y los datos personales de sus usuarios conforme a la Ley 25.326 de Proteccion de Datos Personales de la Republica Argentina." },
  { n: "2", title: "Datos recopilados", content: "La Plataforma puede recopilar:\n\n• Datos personales (edad, sexo, peso, altura)\n• Informacion de salud ingresada voluntariamente\n• Datos clinicos y de laboratorio\n• Informacion tecnica basica (navegador, dispositivo)" },
  { n: "3", title: "Finalidad del tratamiento", content: "Los datos son utilizados unicamente para:\n\n• Generar analisis nutricionales personalizados\n• Mejorar la experiencia de uso\n• Garantizar el funcionamiento tecnico" },
  { n: "4", title: "Uso de datos de salud", content: "Los datos de salud:\n\n• Son ingresados de forma voluntaria\n• Se usan exclusivamente con fines informativos\n• No son compartidos con terceros\n• No son utilizados con fines comerciales externos", highlight: true },
  { n: "5", title: "Confidencialidad y seguridad", content: "VitalCross AI implementa medidas razonables de seguridad para proteger la informacion, aunque no puede garantizar seguridad absoluta frente a accesos no autorizados." },
  { n: "6", title: "Conservacion de datos", content: "Los datos seran conservados mientras el usuario mantenga una cuenta o mientras resulte necesario para brindar el servicio." },
  { n: "7", title: "Derechos del usuario", content: "El usuario puede:\n\n• Solicitar acceso a sus datos\n• Solicitar rectificacion\n• Solicitar eliminacion\n• Revocar consentimientos\n\nContacto: info@vitalcrossai.com.ar", highlight: true },
  { n: "8", title: "Transferencias de datos", content: "VitalCross AI no vende ni alquila datos personales.\n\nNo se realizan transferencias a terceros sin consentimiento." },
  { n: "9", title: "Enlaces externos", content: "La Plataforma puede contener enlaces a terceros. VitalCross AI no es responsable por sus politicas de privacidad." },
  { n: "10", title: "Cambios en la politica", content: "La Politica de Privacidad podra ser modificada. Las actualizaciones se publicaran en el sitio web." },
  { n: "11", title: "Contacto", content: "Correo electronico: info@vitalcrossai.com.ar\nSitio web: https://www.vitalcrossai.com.ar" },
];

export default function PrivacidadPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: "system-ui, sans-serif" }}>

      <nav style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center", padding: "0.4rem 1.25rem", background: "#FFFFFF", borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link href="/" style={{ fontSize: "15px", fontWeight: 700, textDecoration: "none" }}>
            <span style={{ color: "#185FA5" }}>Vital</span><span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </Link>
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Link href="/"><Image src="/Logo.png" alt="VitalCross AI" width={80} height={80} style={{ objectFit: "contain", display: "block" }} /></Link>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Link href="/dashboard" style={{ padding: "7px 16px", borderRadius: "8px", border: "1.5px solid #B5D4F4", color: "#5F5E5A", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>
            ← Volver
          </Link>
        </div>
      </nav>

      <section style={{ background: "linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #378ADD 100%)", padding: "3rem 2rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px", padding: "4px 14px", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.8px", marginBottom: "1rem", textTransform: "uppercase" }}>Legal</div>
          <h1 style={{ margin: "0 0 0.75rem", color: "#FFFFFF", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", lineHeight: 1.15 }}>Politica de Privacidad</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", margin: 0 }}>VitalCross AI — Ultima actualizacion: Abril 2026</p>
        </div>
      </section>

      <main style={{ maxWidth: "740px", margin: "0 auto", padding: "3rem 1.5rem" }}>
        <div style={{ background: "#E6F1FB", border: "1.5px solid #B5D4F4", borderRadius: "12px", padding: "1.1rem 1.4rem", marginBottom: "2rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🔒</span>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#0C447C", lineHeight: 1.65 }}>
            <strong>Tus datos son confidenciales.</strong> VitalCross AI no vende ni comparte informacion personal con terceros. Los datos de salud se usan exclusivamente para generar tus analisis.
          </p>
        </div>

        {sections.map((s) => (
          <div key={s.n} style={{ background: s.highlight ? "#E6F1FB" : "#FFFFFF", border: s.highlight ? "1.5px solid #185FA5" : "1px solid #B5D4F4", borderRadius: "12px", padding: "1.4rem 1.6rem", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "0.75rem" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: s.highlight ? "#185FA5" : "#E6F1FB", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: s.highlight ? "#FFFFFF" : "#185FA5" }}>{s.n}</span>
              </div>
              <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: s.highlight ? "#0C447C" : "#2C2C2A" }}>{s.title}</h2>
            </div>
            {s.content.split("\n\n").map((p, i) => (
              <p key={i} style={{ margin: "0 0 0.6rem", fontSize: "0.875rem", color: "#5F5E5A", lineHeight: 1.75, whiteSpace: "pre-line" }}>{p}</p>
            ))}
          </div>
        ))}

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          <Link href="/dashboard" style={{ fontSize: "0.8rem", color: "#185FA5", textDecoration: "none", fontWeight: 600 }}>← Volver al dashboard</Link>
          <span style={{ color: "#B5D4F4", fontSize: "0.8rem" }}>·</span>
          <Link href="/faqs" style={{ fontSize: "0.8rem", color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>Preguntas Frecuentes</Link>
          <span style={{ color: "#B5D4F4", fontSize: "0.8rem" }}>·</span>
          <Link href="/terminos" style={{ fontSize: "0.8rem", color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>Terminos y Condiciones</Link>
        </div>
      </main>

      <footer style={{ background: "#FFFFFF", borderTop: "1px solid #B5D4F4", padding: "1.25rem 2rem", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#888780", fontSize: "0.75rem" }}>VitalCross AI · Analisis nutricional personalizado con inteligencia artificial</p>
      </footer>
    </div>
  );
}