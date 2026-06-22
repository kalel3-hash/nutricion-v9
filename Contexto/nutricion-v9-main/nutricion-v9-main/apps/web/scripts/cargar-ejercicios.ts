import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ydjcbpdoswxpqsepiczi.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const CATEGORIAS_RELEVANTES = [
  'Abs', 'Arms', 'Back', 'Calves', 'Cardio',
  'Chest', 'Legs', 'Shoulders'
]

interface WgerImage {
  image: string
  is_main: boolean
}

interface WgerMuscle {
  name_en: string
}

interface WgerEquipment {
  name: string
}

interface WgerCategory {
  name: string
}

interface WgerTranslation {
  language: number
  name: string
}

interface WgerExercise {
  id: number
  category: WgerCategory
  muscles: WgerMuscle[]
  muscles_secondary: WgerMuscle[]
  equipment: WgerEquipment[]
  images: WgerImage[]
  translations: WgerTranslation[]
}

interface WgerResponse {
  next: string | null
  results: WgerExercise[]
}

async function cargarEjercicios() {
  console.log('Iniciando carga de ejercicios desde wger...')

  let url: string | null = 'https://wger.de/api/v2/exerciseinfo/?format=json&language=2&limit=100&offset=0'
  let totalCargados = 0
  let totalOmitidos = 0

  while (url) {
    console.log(`Consultando: ${url}`)

    const response = await fetch(url)
    const data: WgerResponse = await response.json()

    for (const ejercicio of data.results) {
      // Filtrar por categoría relevante
      if (!CATEGORIAS_RELEVANTES.includes(ejercicio.category?.name)) {
        totalOmitidos++
        continue
      }

      // Filtrar ejercicios sin imagen
      const imagenPrincipal = ejercicio.images?.find(img => img.is_main)
      if (!imagenPrincipal) {
        totalOmitidos++
        continue
      }

      // Obtener nombre en inglés
      const traduccionEn = ejercicio.translations?.find(t => t.language === 2)
      if (!traduccionEn?.name) {
        totalOmitidos++
        continue
      }

      // Obtener nombre en español si existe
      const traduccionEs = ejercicio.translations?.find(t => t.language === 4)

      // Construir registro
      const registro = {
        id: ejercicio.id,
        name_en: traduccionEn.name,
        name_es: traduccionEs?.name || null,
        category: ejercicio.category.name,
        equipment: ejercicio.equipment?.map(e => e.name).join(', ') || 'none',
        image_url: imagenPrincipal.image,
        muscles_primary: ejercicio.muscles?.map(m => m.name_en).filter(Boolean).join(', ') || null,
        muscles_secondary: ejercicio.muscles_secondary?.map(m => m.name_en).filter(Boolean).join(', ') || null,
      }

      const { error } = await supabase
        .from('exercise_catalog')
        .upsert(registro, { onConflict: 'id' })

      if (error) {
        console.error(`Error cargando ejercicio ${ejercicio.id}:`, error.message)
      } else {
        totalCargados++
        console.log(`✓ ${registro.name_en} (${registro.category})`)
      }
    }

    url = data.next
    // Pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`\nCarga completada:`)
  console.log(`✓ Cargados: ${totalCargados}`)
  console.log(`✗ Omitidos (sin imagen o categoría irrelevante): ${totalOmitidos}`)
}

cargarEjercicios().catch(console.error)