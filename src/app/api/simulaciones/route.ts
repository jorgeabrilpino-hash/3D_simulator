import type { ResultadoSimulacion } from '@/engine/types'
import { insertSupabase } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  const resultado = (await request.json()) as ResultadoSimulacion

  const payload = {
    resultado,
    porcentaje: resultado.porcentaje,
    nivel: resultado.nivel,
    aprobado: resultado.aprobado,
    trigger_fallo: resultado.trigger_fallo,
    camino_tomado: resultado.camino_tomado,
    created_at: resultado.fecha,
  }

  try {
    const insert = await insertSupabase('simulaciones', payload)
    return Response.json({ ok: true, ...insert })
  } catch (error) {
    return Response.json({
      ok: false,
      skipped: true,
      error: error instanceof Error ? error.message : 'Error guardando simulacion',
    })
  }
}
