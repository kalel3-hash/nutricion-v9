import Link from "next/link";
import Image from "next/image";

const sections = [
  {
    n: "1", title: "Identificacion del titular",
    content: "El presente sitio web y la plataforma VitalCross AI, accesible desde https://www.vitalcrossai.com.ar, es operado por VitalCross AI (en adelante, la Plataforma).\n\nContacto oficial: info@vitalcrossai.com.ar",
  },
  {
    n: "2", title: "Objeto",
    content: "Estos Terminos y Condiciones regulan el acceso y uso de la Plataforma, cuyos servicios consisten en la provision de informacion nutricional orientativa, generada mediante inteligencia artificial, basada en los datos ingresados voluntariamente por el usuario.",
  },
  {
    n: "3", title: "Aceptacion",
    content: "El uso de la Plataforma implica la aceptacion expresa, libre e informada de estos Terminos.\n\nSi el usuario no acepta estos terminos, debera abstenerse de utilizar los servicios.",
  },
  {
    n: "4", title: "Naturaleza del servicio - No asesoramiento medico",
    content: "VitalCross AI no presta servicios medicos. La informacion generada por la Plataforma:\n\n• No constituye diagnostico medico\n• No constituye tratamiento\n• No constituye prescripcion ni recomendacion medica\n• No reemplaza la consulta con profesionales de la salud\n\nEl Usuario reconoce que toda decision relacionada con su salud debera ser consultada con un profesional medico o de la salud matriculado.",
    highlight: true,
  },
  {
    n: "5", title: "Uso de inteligencia artificial",
    content: "VitalCross AI utiliza sistemas de inteligencia artificial para analizar informacion ingresada por el usuario y cruzarla con conocimiento nutricional y cientifico general.\n\nEl Usuario acepta que:\n\n• Los resultados son estimaciones informativas\n• Pueden existir errores, omisiones o imprecisiones\n• La IA no actua como profesional humano\n• La informacion es orientativa y no vinculante",
  },
  {
    n: "6", title: "Obligaciones del Usuario",
    content: "El Usuario se compromete a:\n\n• Proporcionar informacion veraz y actualizada\n• Utilizar la Plataforma de manera responsable\n• No utilizar la informacion con fines medicos sin asesoramiento profesional\n• No utilizar la Plataforma para fines ilicitos",
  },
  {
    n: "7", title: "Responsabilidad y limitacion",
    content: "VitalCross AI no sera responsable por:\n\n• Danos derivados del uso o interpretacion de la informacion\n• Decisiones tomadas exclusivamente en base al contenido generado\n• Consecuencias de salud derivadas del uso de la Plataforma\n\nEl uso del servicio es bajo exclusiva responsabilidad del Usuario.",
  },
  {
    n: "8", title: "Disponibilidad y modificaciones",
    content: "La Plataforma podra modificar funcionalidades, suspender servicios y actualizar contenidos sin necesidad de previo aviso.\n\nNo se garantiza disponibilidad continua e ininterrumpida.",
  },
  {
    n: "9", title: "Propiedad intelectual",
    content: "Todos los contenidos, marcas, textos, logos, graficos y funcionalidades pertenecen a VitalCross AI o sus licenciantes.\n\nQueda prohibida su reproduccion sin autorizacion expresa.",
  },
  {
    n: "10", title: "Legislacion aplicable y jurisdiccion",
    content: "Estos Terminos se rigen por las leyes de la Republica Argentina.\n\nCualquier controversia sera sometida a los tribunales competentes.",
  },
  {
    n: "11", title: "Contacto",
    content: "Correo electronico: info@vitalcrossai.com.ar\nSitio web: https://www.vitalcrossai.com.ar",
  },
];

export default function TerminosPage() {
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
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
          <Link href="/login" style={{ padding: "7px 16px", borderRadius: "8px", border: "1.5px solid #185FA5", color: "#185FA5", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>Iniciar sesion</Link>
          <Link href="/register" style={{ padding: "7px 16px", borderRadius: "8px", background: "#185FA5", color: "#FFFFFF", fontSize: "13px", fontWeight: 500, textDecoration: "none" }}>Crear cuenta</Link>
        </div>
      </nav>

      <section style={{ background: "linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #378ADD 100%)", padding: "3rem 2rem 2.5rem", textAlign: "center" }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div style={{ display: "inline-block", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: "20px", padding: "4px 14px", fontSize: "0.7rem", fontWeight: 700, color: "rgba(255,255,255,0.85)", letterSpacing: "0.8px", marginBottom: "1rem", textTransform: "uppercase" }}>
            Legal
          </div>
          <h1 style={{ margin: "0 0 0.75rem", color: "#FFFFFF", fontWeight: 800, fontSize: "clamp(1.5rem, 4vw, 2.25rem)", lineHeight: 1.15 }}>
            Terminos y Condiciones de Uso
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.85rem", margin: 0 }}>
            VitalCross AI — Ultima actualizacion: Abril 2026
          </p>
        </div>
      </section>

      <main style={{ maxWidth: "740px", margin: "0 auto", padding: "3rem 1.5rem" }}>

        <div style={{ background: "#FEE2E2", border: "1.5px solid #FECACA", borderRadius: "12px", padding: "1.1rem 1.4rem", marginBottom: "2rem", display: "flex", gap: "10px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>⚠️</span>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#991B1B", lineHeight: 1.65 }}>
            <strong>VitalCross AI no presta servicios medicos.</strong> La informacion generada es orientativa y educativa. No reemplaza la consulta con un profesional de la salud matriculado.
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
          <Link href="/faqs" style={{ fontSize: "0.8rem", color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>Preguntas Frecuentes</Link>
          <span style={{ color: "#B5D4F4", fontSize: "0.8rem" }}>·</span>
          <Link href="/privacidad" style={{ fontSize: "0.8rem", color: "#185FA5", textDecoration: "none", fontWeight: 500 }}>Politica de Privacidad</Link>
        </div>
      </main>

      <footer style={{ background: "#FFFFFF", borderTop: "1px solid #B5D4F4", padding: "1.25rem 2rem", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#888780", fontSize: "0.75rem" }}>VitalCross AI · Analisis nutricional personalizado con inteligencia artificial</p>
      </footer>
    </div>
  );
}