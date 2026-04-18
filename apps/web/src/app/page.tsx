import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F0F6FF", fontFamily: "system-ui, sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "1rem 2rem", background: "#FFFFFF",
        borderBottom: "1px solid #B5D4F4", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Image src="/Logo.png" alt="VitalCross AI" width={56} height={56} style={{ objectFit: "contain" }} />
          <span style={{ fontSize: "15px", fontWeight: 600 }}>
            <span style={{ color: "#185FA5" }}>Vital</span>
            <span style={{ color: "#2C2C2A" }}>Cross AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <Link href="/login" style={{
            padding: "7px 18px", borderRadius: "8px", border: "1.5px solid #185FA5",
            background: "transparent", color: "#185FA5", fontSize: "13px", fontWeight: 500, textDecoration: "none",
          }}>Iniciar sesión</Link>
          <Link href="/register" style={{
            padding: "7px 18px", borderRadius: "8px", border: "none",
            background: "#185FA5", color: "#FFFFFF", fontSize: "13px", fontWeight: 500, textDecoration: "none",
          }}>Crear cuenta gratis</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 60%, #378ADD 100%)",
        padding: "5rem 2rem 4rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <div style={{
            display: "inline-block", background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.3)", borderRadius: "20px",
            padding: "6px 16px", fontSize: "0.78rem", fontWeight: 600,
            color: "#FFFFFF", letterSpacing: "0.5px", marginBottom: "1.5rem",
            textTransform: "uppercase",
          }}>
            Nutrición personalizada con IA
          </div>

          <h1 style={{
            margin: "0 0 1.25rem", color: "#FFFFFF", fontWeight: 800,
            fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.15, letterSpacing: "-0.5px",
          }}>
            Un mismo alimento no es igual para todos.{" "}
            <span style={{ color: "#85B7EB" }}>Descubrí cómo impacta en vos.</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.85)", fontSize: "clamp(1rem, 2.5vw, 1.15rem)",
            maxWidth: "560px", margin: "0 auto 2.5rem", lineHeight: 1.7,
          }}>
            VitalCross AI analiza alimentos teniendo en cuenta tus análisis clínicos reales, 
            tu perfil de salud y tu contexto personal para darte información concreta y basada en evidencia.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{
              padding: "14px 2.5rem", borderRadius: "10px",
              background: "#FFFFFF", color: "#185FA5",
              fontSize: "1rem", fontWeight: 700, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}>
              Analizá tu alimentación gratis
            </Link>
            <Link href="/login" style={{
              padding: "14px 2.5rem", borderRadius: "10px",
              border: "2px solid rgba(255,255,255,0.5)",
              background: "transparent", color: "#FFFFFF",
              fontSize: "1rem", fontWeight: 500, textDecoration: "none",
            }}>
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* PROBLEMA */}
      <section style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <span style={{
            display: "inline-block", background: "#FEE2E2", border: "1px solid #FECACA",
            borderRadius: "20px", padding: "5px 14px",
            fontSize: "0.75rem", fontWeight: 700, color: "#991B1B",
            textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem",
          }}>
            El problema real
          </span>
          <h2 style={{ margin: "0 0 1rem", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#2C2C2A" }}>
            Los consejos genéricos no funcionan para la mayoría
          </h2>
          <p style={{ margin: 0, color: "#5F5E5A", fontSize: "1rem", lineHeight: 1.7, maxWidth: "580px", marginLeft: "auto", marginRight: "auto" }}>
            En redes sociales y en internet vemos todo el tiempo afirmaciones como estas:
          </p>
        </div>

        {/* Frases del problema */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.875rem", marginBottom: "2rem" }}>
          {[
            '"El arroz es malo"',
            '"El pan engorda"',
            '"Este alimento es saludable para todos"',
            '"Comé esto y bajás de peso"',
          ].map((frase) => (
            <div key={frase} style={{
              background: "#FFFFFF", border: "1px solid #FECACA", borderRadius: "10px",
              padding: "1rem 1.25rem", display: "flex", alignItems: "flex-start", gap: "10px",
            }}>
              <span style={{ color: "#991B1B", fontSize: "1.1rem", flexShrink: 0 }}>❌</span>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#2C2C2A", fontStyle: "italic", lineHeight: 1.5 }}>{frase}</p>
            </div>
          ))}
        </div>

        <div style={{
          background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: "12px",
          padding: "1.25rem 1.5rem", textAlign: "center",
        }}>
          <p style={{ margin: 0, fontSize: "1rem", color: "#991B1B", fontWeight: 600, lineHeight: 1.6 }}>
            Hablan en general, como si todas las personas fueran iguales. Pero no lo somos.
          </p>
        </div>
      </section>

      {/* VERDAD */}
      <section style={{ background: "#FFFFFF", padding: "4rem 2rem", borderTop: "1px solid #B5D4F4", borderBottom: "1px solid #B5D4F4" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{
              display: "inline-block", background: "#E6F1FB", border: "1px solid #B5D4F4",
              borderRadius: "20px", padding: "5px 14px",
              fontSize: "0.75rem", fontWeight: 700, color: "#185FA5",
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem",
            }}>
              La verdad que casi nadie explica
            </span>
            <h2 style={{ margin: "0 0 1rem", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#2C2C2A" }}>
              Un mismo alimento puede ser tres cosas distintas
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2.5rem" }}>
            {[
              { icon: "✅", label: "Recomendable", desc: "Para una persona con valores normales", bg: "#EAF3DE", border: "#C0DD97", color: "#27500A" },
              { icon: "⚠️", label: "Neutral o con cuidado", desc: "Para otra con resistencia a la insulina", bg: "#FAEEDA", border: "#FAC775", color: "#854F0B" },
              { icon: "⛔", label: "Desaconsejado", desc: "Para alguien con diabetes mal controlada", bg: "#FEE2E2", border: "#FECACA", color: "#991B1B" },
            ].map((item) => (
              <div key={item.label} style={{
                background: item.bg, border: `1.5px solid ${item.border}`,
                borderRadius: "12px", padding: "1.5rem", textAlign: "center",
              }}>
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>{item.icon}</div>
                <p style={{ margin: "0 0 0.4rem", fontWeight: 700, color: item.color, fontSize: "0.95rem" }}>{item.label}</p>
                <p style={{ margin: 0, fontSize: "0.82rem", color: item.color, opacity: 0.85, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign: "center", color: "#5F5E5A", fontSize: "0.9rem", lineHeight: 1.7, margin: "0 0 1.5rem" }}>
            Depende de cosas reales y medibles: glucemia, colesterol, triglicéridos, función renal, resistencia a la insulina, medicación, patologías previas y objetivos personales.
          </p>
          <div style={{
            background: "#E6F1FB", border: "1px solid #85B7EB",
            borderRadius: "10px", padding: "1rem 1.5rem", textAlign: "center",
          }}>
            <p style={{ margin: 0, color: "#0C447C", fontWeight: 600, fontSize: "0.95rem" }}>
              Sin esos datos, cualquier consejo nutricional es incompleto.
            </p>
          </div>
        </div>
      </section>

      {/* EJEMPLO DEL ARROZ */}
      <section style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🍚</div>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#2C2C2A" }}>
            ¿Es bueno comer arroz?
          </h2>
          <p style={{ margin: 0, color: "#5F5E5A", fontSize: "1rem", lineHeight: 1.6 }}>
            Depende de quién lo come.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem", marginBottom: "2rem" }}>
          {[
            { icon: "✅", perfil: "Persona con análisis normales", resultado: "Puede ser adecuado como fuente de energía", bg: "#EAF3DE", border: "#C0DD97", color: "#27500A" },
            { icon: "⚠️", perfil: "Persona con resistencia a la insulina", resultado: "Hay que controlar la porción y combinarlo bien", bg: "#FAEEDA", border: "#FAC775", color: "#854F0B" },
            { icon: "⛔", perfil: "Persona con diabetes mal controlada", resultado: "Puede ser perjudicial y elevar la glucemia", bg: "#FEE2E2", border: "#FECACA", color: "#991B1B" },
          ].map((item) => (
            <div key={item.perfil} style={{
              background: item.bg, border: `1.5px solid ${item.border}`,
              borderRadius: "12px", padding: "1.25rem 1.5rem",
              display: "flex", alignItems: "flex-start", gap: "1rem",
            }}>
              <span style={{ fontSize: "1.5rem", flexShrink: 0 }}>{item.icon}</span>
              <div>
                <p style={{ margin: "0 0 0.25rem", fontWeight: 700, color: item.color, fontSize: "0.9rem" }}>{item.perfil}</p>
                <p style={{ margin: 0, color: item.color, fontSize: "0.85rem", opacity: 0.9, lineHeight: 1.5 }}>{item.resultado}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          background: "#185FA5", borderRadius: "14px",
          padding: "1.75rem", textAlign: "center",
        }}>
          <p style={{ margin: "0 0 0.5rem", color: "#FFFFFF", fontSize: "1.1rem", fontWeight: 700 }}>
            El arroz no es "bueno" ni "malo"
          </p>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.6 }}>
            Es bueno o malo según <strong>tu cuerpo</strong>. Lo mismo pasa con el pan, el tomate, la fruta, los lácteos, las grasas y el azúcar.
          </p>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section style={{ background: "#FFFFFF", padding: "4rem 2rem", borderTop: "1px solid #B5D4F4", borderBottom: "1px solid #B5D4F4" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
            <span style={{
              display: "inline-block", background: "#E6F1FB", border: "1px solid #B5D4F4",
              borderRadius: "20px", padding: "5px 14px",
              fontSize: "0.75rem", fontWeight: 700, color: "#185FA5",
              textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "1rem",
            }}>
              ¿Cómo funciona?
            </span>
            <h2 style={{ margin: 0, fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#2C2C2A" }}>
              Cuatro pasos simples
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1rem" }}>
            {[
              { step: "1", icon: "🔬", title: "Ingresás tus análisis clínicos", desc: "Cargás tus valores de laboratorio manualmente o subís una foto/PDF y la IA los extrae automáticamente." },
              { step: "2", icon: "🧬", title: "Completás tu perfil de salud", desc: "Edad, peso, condiciones médicas, medicación y objetivos. Todo lo que hace que tu situación sea única." },
              { step: "3", icon: "📸", title: "Analizás un alimento", desc: "Por texto libre, foto del plato o foto de la etiqueta nutricional. La IA procesa todo en segundos." },
              { step: "4", icon: "🎯", title: "Recibís tu análisis personalizado", desc: "Impacto en tu salud, relación con tus valores clínicos, sugerencias de ajuste y fuentes científicas." },
            ].map((item) => (
              <div key={item.step} style={{
                background: "#F8FBFF", border: "1px solid #B5D4F4",
                borderRadius: "12px", padding: "1.5rem",
                display: "flex", gap: "1rem", alignItems: "flex-start",
              }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  background: "#185FA5", color: "#FFFFFF",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.85rem", fontWeight: 800, flexShrink: 0,
                }}>
                  {item.step}
                </div>
                <div>
                  <div style={{ fontSize: "1.25rem", marginBottom: "0.4rem" }}>{item.icon}</div>
                  <p style={{ margin: "0 0 0.4rem", fontWeight: 700, color: "#2C2C2A", fontSize: "0.95rem" }}>{item.title}</p>
                  <p style={{ margin: 0, color: "#5F5E5A", fontSize: "0.85rem", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUÉ OBTENÉS */}
      <section style={{ padding: "4rem 2rem", maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <h2 style={{ margin: "0 0 0.75rem", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 700, color: "#2C2C2A" }}>
            Qué obtenés para cada alimento
          </h2>
          <p style={{ margin: 0, color: "#5F5E5A", fontSize: "1rem" }}>No es una dieta. No es una lista genérica. No es una moda.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.875rem" }}>
          {[
            { icon: "🎯", title: "Impacto personalizado", desc: "Qué efecto tiene ese alimento en tu salud específica" },
            { icon: "🧬", title: "Relación con tus valores", desc: "Cómo se vincula con tu glucemia, colesterol y más" },
            { icon: "💡", title: "Sugerencias concretas", desc: "Porciones, alternativas y modificaciones posibles" },
            { icon: "📚", title: "Base científica", desc: "Referencias a estudios y evidencia médica real" },
          ].map((item) => (
            <div key={item.title} style={{
              background: "#FFFFFF", border: "1px solid #B5D4F4",
              borderRadius: "12px", padding: "1.5rem", textAlign: "center",
            }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{item.icon}</div>
              <p style={{ margin: "0 0 0.4rem", fontWeight: 700, color: "#2C2C2A", fontSize: "0.9rem" }}>{item.title}</p>
              <p style={{ margin: 0, color: "#5F5E5A", fontSize: "0.82rem", lineHeight: 1.55 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{
        background: "linear-gradient(135deg, #0C447C 0%, #185FA5 100%)",
        padding: "4rem 2rem", textAlign: "center",
      }}>
        <div style={{ maxWidth: "560px", margin: "0 auto" }}>
          <h2 style={{ margin: "0 0 1rem", color: "#FFFFFF", fontSize: "clamp(1.5rem, 4vw, 2.25rem)", fontWeight: 800, lineHeight: 1.2 }}>
            VitalCross AI no te dice qué está bien o mal en general.
          </h2>
          <p style={{ margin: "0 0 2.5rem", color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", lineHeight: 1.65 }}>
            Te dice qué está bien o mal <strong style={{ color: "#FFFFFF" }}>para vos</strong>.
          </p>
          <Link href="/register" style={{
            display: "inline-block", padding: "15px 3rem", borderRadius: "10px",
            background: "#FFFFFF", color: "#185FA5",
            fontSize: "1.05rem", fontWeight: 700, textDecoration: "none",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
          }}>
            Crear cuenta gratis
          </Link>
          <p style={{ margin: "1.25rem 0 0", color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
            Sin tarjeta de crédito · Gratis para empezar
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        background: "#FFFFFF", borderTop: "1px solid #B5D4F4",
        padding: "1.5rem 2rem", textAlign: "center",
      }}>
        <p style={{ margin: 0, color: "#888780", fontSize: "0.78rem" }}>
          VitalCross AI · Análisis nutricional personalizado con inteligencia artificial
        </p>
      </footer>

    </div>
  );
}