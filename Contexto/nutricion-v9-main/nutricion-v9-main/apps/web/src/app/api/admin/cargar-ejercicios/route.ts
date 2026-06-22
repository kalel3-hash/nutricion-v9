import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const maxDuration = 60

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const CATEGORIAS_RELEVANTES = [
  'Abs', 'Arms', 'Back', 'Calves', 'Cardio',
  'Chest', 'Legs', 'Shoulders'
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const offset = parseInt(searchParams.get('offset') || '0')
  const limit = 100

  try {
    const url = `https://wger.de/api/v2/exerciseinfo/?format=json&language=2&limit=${limit}&offset=${offset}`
    const response = await fetch(url)
    const data = await response.json()

    let cargados = 0
    let omitidos = 0
    const errores: string[] = []

    for (const ejercicio of data.results) {
      if (!CATEGORIAS_RELEVANTES.includes(ejercicio.category?.name)) {
        omitidos++
        continue
      }

      const imagenPrincipal = ejercicio.images?.find((img: any) => img.is_main)
      if (!imagenPrincipal) {
        omitidos++
        continue
      }

      const traduccionEn = ejercicio.translations?.find((t: any) => t.language === 2)
      if (!traduccionEn?.name) {
        omitidos++
        continue
      }

      const traduccionEs = ejercicio.translations?.find((t: any) => t.language === 4)

      const registro = {
        id: ejercicio.id,
        name_en: traduccionEn.name,
        name_es: traduccionEs?.name || null,
        category: ejercicio.category.name,
        equipment: ejercicio.equipment?.map((e: any) => e.name).join(', ') || 'none',
        image_url: imagenPrincipal.image,
        muscles_primary: ejercicio.muscles?.map((m: any) => m.name_en).filter(Boolean).join(', ') || null,
        muscles_secondary: ejercicio.muscles_secondary?.map((m: any) => m.name_en).filter(Boolean).join(', ') || null,
      }

      const { error } = await supabase
        .from('exercise_catalog')
        .upsert(registro, { onConflict: 'id' })

      if (error) {
        errores.push(`${ejercicio.id}: ${error.message}`)
      } else {
        cargados++
      }
    }

    return NextResponse.json({
      offset,
      siguiente_offset: data.next ? offset + limit : null,
      total_en_pagina: data.results.length,
      cargados,
      omitidos,
      errores,
      hay_mas: !!data.next
    })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}