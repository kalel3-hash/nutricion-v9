# VitalCross AI — Documento de Continuidad

**Actualizado:** 2026-06-19
**Producción:** https://www.vitalcrossai.com.ar
**URL alternativa:** https://nutricion-v9.vercel.app
**Repo:** https://github.com/kalel3-hash/nutricion-v9

---

## 0) INSTRUCCIONES PARA LA IA

Rol: Project Manager + Full-Stack Engineer. Continuar el desarrollo de VitalCross AI con Ignacio Sanchez, quien no tiene experiencia en programación.

Reglas obligatorias:
- Guiar paso a paso.
- Siempre usar herramientas gratuitas salvo que sea imprescindible pagar.
- No escribir valores de claves en el código. Usar variables de entorno.
- Mantener streaming en rutas de IA (evita timeouts de Vercel).
- Antes de modificar un archivo, pedirlo completo.
- Para editar: SIEMPRE dar el archivo completo para reemplazar. NUNCA editar parcialmente.
- Siempre dar la ruta completa cuando se entrega un archivo.
- Dar comandos git simples, sin caracteres especiales: `git add .` / `git commit -m "descripcion"` / `git push`
- Nunca usar localhost — todo testing se hace en producción vía Vercel.
- Confirmar arquitectura con preguntas antes de escribir código cuando el alcance no esté 100% claro.
- Analizar con cuidado antes de responder rápido.

---

## 1) STACK TECNOLÓGICO

- Next.js 14 App Router, TypeScript
- Supabase (auth + base de datos), región São Paulo
- Google OAuth vía NextAuth
- Gemini API: `gemini-2.5-flash` (uso general), `gemini-2.5-flash-lite` (rutas sensibles a timeout, como generación de planes de ejercicio)
- Vercel (deploy automático desde GitHub main)
- Recharts (analytics admin)
- Monorepo: `C:\proyectos\nutricion-v9\apps\web`

---

## 2) MÓDULOS ACTIVOS

### Analizar alimentos
Análisis de alimentos con streaming, considerando perfil clínico. Con historial.

### Revisar medicamento recetado
Análisis de producto/medicamento con streaming, imagen, tabla `medication_history` propia en Supabase. Posicionado como ayuda para preparar preguntas al médico, no como evaluación clínica.

### Ejercicios (recién construido, funcional)
- Wizard de 5 pasos: objetivo, días/semana, equipamiento, nivel, restricciones físicas.
- Genera plan semanal (1 semana, no 4) vía Gemini 2.5 Flash-Lite, considerando perfil clínico.
- Catálogo de ejercicios propio en Supabase (`exercise_catalog`, 272 ejercicios cargados desde la API pública de wger, con imagen, categoría, equipamiento y músculos).
- El plan generado referencia ejercicios por `EJERCICIO_ID` del catálogo; el frontend matchea y muestra imagen inline.
- Persistencia: el último plan generado se guarda en `exercise_plans` y se carga automáticamente al volver a entrar al módulo (no repite el wizard si ya hay un plan).
- Parser tolerante a errores de formato del modelo: si falta la sección "OBJETIVO DEL PLAN", se autogenera en el frontend según el objetivo elegido; se limpian mezclas de texto tipo "DÍA OBJETIVO DEL PLAN:1:" → "DÍA 1:".
- Decisión de alcance: plan de 1 semana (no 4), máximo 5 ejercicios por día, catálogo recortado a 40 ejercicios en el prompt — todo esto para evitar el timeout de 60s de Vercel con Gemini.

### Admin panel
Incluye tab de Waitlist con contador y analytics.

### Waitlist
Se activa cuando el usuario alcanza límites diarios/mensuales de consultas en los módulos de alimentos y medicamentos.

---

## 3) TAREA PENDIENTE — REESTRUCTURACIÓN DE NAVBAR Y DASHBOARD

Esta es la tarea a continuar en el próximo chat. Alcance ya confirmado por Ignacio, no volver a preguntar — solo ejecutar:

### Dashboard (`/dashboard`)
Reducir a exactamente 3 tarjetas:
1. Perfil de salud
2. Analizar alimento
3. Ejercicios

Se eliminan del dashboard las tarjetas: Historial alimentos, Historial medicamentos, Mi evolución (su acceso se mueve a los dropdowns del navbar, ver abajo).

### Navbar (`NavbarProtegido.tsx`)
Reemplazar los ítems planos actuales (Analizar, Ejercicios, Medicamentos, Historial, Evolución) por:

- **Analizar** → dropdown con: Analizar alimentos, Historial, Evolución
- **Ejercicios** → enlace directo, SIN dropdown (queda igual que ahora)
- **Medicamentos** → dropdown con: Revisar medicamento, Historial de medicamentos

Los ítems "Historial" y "Evolución" dejan de existir como entradas directas del navbar; solo se acceden vía el dropdown de "Analizar".

Las rutas en sí (`/historial`, `/evolucion`, `/medicamentos`, etc.) no cambian, solo cambia la navegación hacia ellas.

### Pendiente de definir en el próximo chat
- Estructura visual/técnica exacta de los dropdowns (componente a usar, comportamiento mobile dado que el navbar actual oculta `nav-link` en `max-width:540px`).
- Confirmar si el dropdown de Medicamentos tiene exactamente 2 opciones (Revisar medicamento, Historial de medicamentos) o si falta alguna.

---

## 4) ARCHIVOS CLAVE PARA ESTA TAREA

- `src/components/NavbarProtegido.tsx` — navbar actual con array `navLinks` plano, estilos inline + bloque `<style>` con clases `.nav-link`, `.nav-extra-link`, responsive en `max-width:540px`.
- `src/app/(protected)/dashboard/page.tsx` (o su client component) — contiene las 6 tarjetas actuales del dashboard, hay que pedirlo completo antes de tocarlo.
- `src/app/(protected)/layout.tsx` — layout protegido, usa `NavbarProtegido` indirectamente vía cada página.

---

## 5) APRENDIZAJES CLAVE DE ESTA SESIÓN

- **Vercel timeout (60s) es la restricción dominante** para cualquier ruta que llame a Gemini con generación larga. Mitigaciones que funcionaron: usar `gemini-2.5-flash-lite` en vez de `gemini-2.5-flash`, recortar el catálogo/contexto enviado en el prompt, bajar `maxOutputTokens`, reducir el alcance del contenido pedido (1 semana en vez de 4).
- **wger API (`wger.de/api/v2/`)** es gratuita y sin límites prácticos, pero tiene particularidades: el endpoint `exercise/search` no funciona bien; `exerciseinfo/{id}` es el que trae todo (nombre, imagen, traducciones, músculos) en una sola llamada. El catálogo se cargó vía una ruta propia (`/api/admin/cargar-ejercicios`) paginada manualmente por offset, porque el fetch directo desde la máquina local de Ignacio fallaba (red bloqueada), pero desde Vercel funcionó sin problemas.
- **Modelos de IA no son 100% confiables con formato estricto.** La solución robusta no es seguir ajustando el prompt indefinidamente, sino hacer el parser del frontend tolerante a errores conocidos (texto faltante, mezclas de secciones) y autocompletar con datos que la propia app ya conoce (como el objetivo elegido en el wizard).
- **Persistencia de resultados generados por IA**: si el usuario sale y vuelve, debe ver su último resultado sin tener que regenerar. Patrón aplicado: guardar en Supabase tras generar, exponer un GET que trae el último registro por `owner_email`, cargarlo en el `useEffect` inicial del client component.

---

## 6) PRINCIPIOS DE TRABAJO DE IGNACIO (mantener siempre)

- Pedir el archivo completo antes de editarlo.
- Entregar siempre el archivo completo para reemplazar, nunca diffs ni fragmentos.
- Incluir la ruta completa del archivo en cada entrega.
- Incluir comandos git simples cuando haya cambios para deployar.
- Confirmar decisiones de arquitectura antes de escribir código si el alcance no está claro al 100%.
- Ignacio prueba en producción (Vercel), nunca en localhost.
