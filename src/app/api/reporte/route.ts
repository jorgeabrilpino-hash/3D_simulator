import type { ReporteIA, ResultadoSimulacion } from '@/engine/types'
import { generarConOpenRouter } from '@/lib/openrouterClient'

function fallbackReporte(resultado: ResultadoSimulacion): ReporteIA {
  return {
    resumen: `Camino registrado: ${resultado.camino_tomado.join(' -> ')}.`,
    fortalezas: ['El simulador registro decisiones utiles para retroalimentacion.'],
    temas_a_reforzar: resultado.trigger_fallo
      ? [`Revisar el trigger de fallo: ${resultado.trigger_fallo}.`]
      : ['Reforzar la secuencia de identificacion, comunicacion, aislamiento y espera segura.'],
    plan_estudio: [
      'Repasar DS 021-2008-MTC Art. 48 sobre EPP y manipulacion.',
      'Repasar DS 021-2008-MTC Art. 160 sobre comunicacion y acciones inmediatas.',
      'Practicar identificacion ONU 1830, Clase 8 y uso de SDS.',
    ],
    mensaje_motivacional: 'Repite la simulacion para observar como cambian las consecuencias segun tus decisiones.',
  }
}

export async function POST(request: Request) {
  const resultado = (await request.json()) as ResultadoSimulacion

  const prompt = `Genera un JSON ReporteIA para ChemSim Peru.
Incluye worldState_final, camino_tomado y trigger_fallo.
No menciones puntaje, porcentaje, nivel de desempeno ni cual era la respuesta correcta.
Resultado: ${JSON.stringify(resultado)}
Devuelve solo JSON con: resumen, fortalezas, temas_a_reforzar, plan_estudio, mensaje_motivacional.`

  try {
    const text = await generarConOpenRouter([
      { role: 'system', content: 'Eres instructor de emergencias quimicas. Devuelve JSON valido sin markdown.' },
      { role: 'user', content: prompt },
    ])
    const parsed = JSON.parse(text) as ReporteIA
    return Response.json(parsed)
  } catch {
    return Response.json(fallbackReporte(resultado))
  }
}
