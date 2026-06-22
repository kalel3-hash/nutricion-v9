# VitalCross AI — Documento de Continuidad

**Actualizado:** 2026-06-20
**Produccion:** https://www.vitalcrossai.com.ar
**URL alternativa:** https://nutricion-v9.vercel.app
**Repo:** https://github.com/kalel3-hash/nutricion-v9 (privado, Claude no tiene acceso directo)

---

## 0) INSTRUCCIONES PARA LA IA

Rol: Project Manager + Full-Stack Engineer. Continuar el desarrollo de VitalCross AI con Ignacio Sanchez, quien no tiene experiencia en programacion.

Reglas obligatorias:
- Guiar paso a paso.
- Siempre usar herramientas gratuitas salvo que sea imprescindible pagar.
- No escribir valores de claves en el codigo. Usar variables de entorno.
- Mantener streaming en rutas de IA (evita timeouts de Vercel).
- Antes de modificar un archivo, pedirlo completo.
- Para editar: SIEMPRE dar el archivo completo para reemplazar. NUNCA editar parcialmente.
- Siempre dar la ruta completa cuando se entrega un archivo.
- Dar comandos git simples, sin caracteres especiales: `git add .` / `git commit -m "descripcion"` / `git push`
- Nunca usar localhost — todo testing se hace en produccion via Vercel.
- Confirmar arquitectura con preguntas antes de escribir codigo cuando el alcance no este 100% claro.
- Validar sintaxis de cada archivo (JSX/TSX) en sandbox antes de entregarlo — ya hubo errores de build por corrupcion de caracteres en el copy-paste (ver seccion 8). Si el archivo tiene bloques de JSX complejos o atributos largos en una sola etiqueta, preferir entregarlo como archivo descargable en vez de bloque de codigo para copiar a mano.
- Nunca dar consejos medicos directivos (dosis, horarios de medicacion, indicaciones de tratamiento). Todo comentario de salud debe quedar como informativo, sugiriendo conversarlo con un profesional — VitalCross AI no reemplaza la consulta medica, en ningun modulo.

---

## 1) STACK TECNOLOGICO

- Next.js 16.2.1 (Turbopack) App Router, TypeScript, React 19
- Supabase (auth + base de datos), region Sao Paulo
- Google OAuth via NextAuth v5 (la sesion se maneja SOLO con NextAuth; Supabase es solo capa de datos, no se usa Supabase Auth para sesiones)
- Gemini API: `gemini-2.5-flash` (uso general), `gemini-2.5-flash-lite` (rutas sensibles a timeout, como ejercicios)
- Vercel (deploy automatico desde GitHub main)
- Recharts (analytics admin)
- Monorepo: `C:\proyectos\nutricion-v9\apps\web`

---

## 2) MODULOS ACTIVOS

### Analizar alimentos
Analisis de alimentos con streaming, considerando perfil clinico. Con historial.

### Revisar medicamento recetado
Analisis de producto/medicamento con streaming, imagen, tabla `medication_history` propia. Posicionado como ayuda para preparar preguntas al medico, no como evaluacion clinica.

### Ejercicios
Wizard de 5 pasos, plan semanal generado con Gemini 2.5 Flash-Lite + catalogo propio de 272 ejercicios (`exercise_catalog`, cargado desde wger). Plan persiste en `exercise_plans`, se autocarga al volver a entrar.

### Admin panel
Tabs: Resumen, Usuarios, Analisis, Uso, Waitlist. El tab Resumen tiene un link directo a `https://aistudio.google.com/usage` (dashboard de costo/consumo de Gemini de Google AI Studio) — se descarto construir tracking propio de tokens por ser desproporcionado en costo/complejidad para el beneficio.

### Waitlist
Se activa cuando el usuario alcanza limites diarios/mensuales de consultas.

---

## 3) CAMBIOS DE ESTA SESION (2026-06-20)

### Navegacion reestructurada (completado y deployado)
- `NavbarProtegido.tsx`: dropdowns por click (no hover) para "Analizar" (Analizar alimentos, Historial, Evolucion) y "Medicamentos" (Revisar medicamento, Historial de medicamentos). "Ejercicios" como link directo.
- Se detecto y corrigio un bug preexistente: el navbar ocultaba TODOS los links y el boton de cerrar sesion por debajo de 540px sin alternativa. Se agrego menu hamburguesa para mobile con panel desplegable.
- Dashboard reducido a exactamente 3 tarjetas: Perfil de salud, Analizar alimento, Ejercicios (se agrego la tarjeta de Ejercicios, que antes no existia en el dashboard; se sacaron Medicamentos, Historial alimentos, Historial medicamentos, Mi evolucion del dashboard — acceso queda via navbar).
- Tarjeta de Ejercicios sin badge dinamico todavia (pendiente: confirmar el endpoint GET que devuelve el ultimo `exercise_plans` para mostrar "Plan generado / Sin plan").
- Seccion "Como funciona VitalCross AI?" del dashboard: se agrego tarjeta de Ejercicios como paso 3, renumerando Medicamentos a 4 y Evolucion a 5.

### FAQs actualizadas (completado y deployado)
Se agregaron 5 preguntas nuevas a `src/app/faqs/page.tsx`: 3 sobre el modulo de medicamentos, 2 sobre ejercicios, cada bloque con su disclaimer "highlight" de que no reemplaza indicacion profesional.

### Admin: link a billing de Gemini (completado y deployado)
Se evaluo y descarto loguear tokens propios (requeria BigQuery + service account nuevo, desproporcionado). En su lugar, banner con link directo a `https://aistudio.google.com/usage` en el tab Resumen del admin.

### Seguridad: grants de Supabase (completado)
Se verifico el cambio de politica de Supabase (Data API deja de exponer tablas nuevas por default a partir del 30/10/2026) — las tablas existentes NO estaban en riesgo, tenian grants completos. Pero se detecto que las 7 tablas (`analysis_history`, `exercise_catalog`, `exercise_plans`, `health_profiles`, `medication_history`, `usage_limits`, `waitlist`) le daban permiso COMPLETO (incluyendo DELETE y TRUNCATE) a los roles `anon` y `authenticated`, que la app nunca usa (todo el acceso a datos es server-side via `service_role`, porque la sesion la maneja NextAuth, no Supabase Auth). Se corrio `REVOKE ALL ... FROM anon, authenticated` en las 7 tablas. Confirmado funcionando sin romper nada.

### Bug de build recurrente (resuelto)
Al agregar un bloque `<a>` con muchos atributos inline en `AdminClient.tsx`, el build fallaba en Vercel (Turbopack/SWC) con "Expression expected" / "Unexpected token" en el mismo punto, dos veces, con contenido distinto (se descarto que fueran comillas curvas). La causa real no se identifico con certeza, pero se resolvio: (1) extrayendo el bloque a su propio componente (`GeminiBillingLink()`) en vez de JSX inline largo, y (2) entregando el archivo como descarga directa via `present_files` en vez de bloque de codigo para copiar a mano, eliminando el paso de copy-paste. Funciono. Para archivos con JSX complejo, preferir este enfoque desde el principio.

---

## 4) TAREA EN CURSO — MODULO NUEVO: CALCULADORA DE BALANCE CALORICO

Arquitectura ya confirmada con Ignacio, lista para implementar en el proximo chat:

### Que hace
El usuario carga un dia completo (comidas + ejercicios) en un formulario estructurado. La app calcula:
- Calorias consumidas (desglosadas por comida, estimadas por Gemini a partir de la descripcion de cada item)
- Calorias quemadas en el entrenamiento (estimadas por Gemini, decision explicita de Ignacio de NO usar los datos MET de wger para esto)
- TDEE base (gasto total diario) calculado con formula matematica real (Mifflin-St Jeor + factor de actividad, usando peso/altura/edad/sexo del perfil) — este numero NO lo estima Gemini, para que el numero principal de comparacion sea solido
- Balance / deficit / superavit del dia
- Grasas, impacto glucemico estimado, y otros valores relevantes a definir en la implementacion
- Comentario cruzando el resultado con los valores de laboratorio del perfil (trigliceridos, insulina, HbA1c, etc. — confirmado que estos SI estan guardados en `health_profiles`, ya sea cargados manualmente o extraidos de PDF)

### Restriccion critica de contenido
NINGUN comentario de tipo indicacion de accion sobre medicacion o tratamiento (ej. "tomá tu remedio con el estomago vacio"). Todo comentario de salud debe ser informativo, sugiriendo conversarlo con un profesional — mismo principio que ya aplica en Medicamentos.

### Formulario (estructura acordada)
- 4 bloques de comida fijos: Desayuno, Almuerzo, Merienda, Cena, mas un bloque opcional de Colacion
- Cada bloque: lista de items que el usuario agrega/saca dinamicamente, texto libre por item (ej. "2 huevos cocidos")
- Bloque de ejercicios: lista de entradas con descripcion libre + duracion en minutos

### Persistencia
Se guarda historial (el usuario puede ver dias anteriores calculados). Tabla nueva a crear, ej. `daily_balance_history`: fecha, comidas y ejercicios cargados (jsonb), TDEE calculado, calorias consumidas/quemadas estimadas, deficit/superavit, analisis completo de Gemini, owner_email. Debe incluir `GRANT` explicito solo a `service_role` desde la creacion (no dar de mas a `anon`/`authenticated`, ver seccion de seguridad arriba).

### Navegacion
Tarjeta propia en el dashboard (pasa de 3 a 4 tarjetas) + item directo en el navbar (no dentro de un dropdown existente).

### Pendiente de definir en la implementacion
- Nombre final del modulo/ruta (no se definio todavia)
- Lista exacta de valores nutricionales adicionales a mostrar (grasas e impacto glucemico confirmados; el resto queda a criterio tecnico al implementar)
- Estructura exacta del prompt a Gemini y el formato de respuesta a parsear

---

## 5) PENDIENTES GENERALES

- Definir nombre de ruta y archivos para el modulo de calculadora de balance calorico (seccion 4)
- Confirmar el endpoint GET de `exercise_plans` para agregar el badge dinamico a la tarjeta de Ejercicios en el dashboard
- Alertas de habitos (analisis repetidos con puntaje bajo) — no iniciado
- Modelo de monetizacion con token packs — pendiente de validar demanda via waitlist antes de construir

---

## 6) PRINCIPIOS DE TRABAJO DE IGNACIO (mantener siempre)

- Pedir el archivo completo antes de editarlo.
- Entregar siempre el archivo completo para reemplazar, nunca diffs ni fragmentos.
- Incluir la ruta completa del archivo en cada entrega.
- Incluir comandos git simples cuando haya cambios para deployar.
- Confirmar decisiones de arquitectura antes de escribir codigo si el alcance no esta claro al 100%.
- Ignacio prueba en produccion (Vercel), nunca en localhost.
- Ignacio no tiene background tecnico profundo — si una pregunta requiere que el sepa algo tecnico de memoria (nombres de endpoints, schemas), pedirle el archivo o la captura en vez de preguntarselo directamente.
- Nunca dar consejos medicos directivos en ningun modulo — siempre informativo, sugiriendo hablar con un profesional.
