import type { Escenario, Paso, RespuestaUsuario, ResultadoSimulacion } from './types'

export function evaluarRespuesta(
  escenario: Escenario,
  paso_id: string,
  opcion_id: string
): { es_correcta: boolean; puntaje: number; feedback: string; normativa: string } {
  const paso = escenario.pasos.find((item) => item.id === paso_id)
  if (!paso) throw new Error(`Paso ${paso_id} no encontrado`)

  const opcion = paso.opciones.find((item) => item.id === opcion_id)
  if (!opcion) throw new Error(`Opcion ${opcion_id} no encontrada`)

  return {
    es_correcta: opcion.es_correcta,
    puntaje: opcion.puntaje,
    feedback: opcion.es_correcta ? paso.feedback_correcto : paso.feedback_incorrecto,
    normativa: paso.normativa_ref,
  }
}

export function calcularResultado(
  escenario: Escenario,
  respuestas: RespuestaUsuario[],
  tiempoSegundos: number
): ResultadoSimulacion {
  const puntaje_total = respuestas.reduce((acc, respuesta) => acc + respuesta.puntaje_obtenido, 0)
  const puntaje_maximo = escenario.pasos.reduce(
    (acc, paso) => acc + Math.max(...paso.opciones.map((opcion) => opcion.puntaje)),
    0
  )
  const porcentaje = Math.round((puntaje_total / puntaje_maximo) * 100)

  return {
    escenario_id: escenario.id,
    respuestas,
    puntaje_total,
    puntaje_maximo,
    porcentaje,
    aprobado: porcentaje >= escenario.puntaje_aprobatorio,
    tiempo_total_segundos: tiempoSegundos,
    fecha: new Date().toISOString(),
  }
}

export function obtenerPasoPorOrden(escenario: Escenario, orden: number): Paso | undefined {
  return escenario.pasos.find((paso) => paso.orden === orden)
}

export function obtenerObjetoActivo(escenario: Escenario, pasoIndex: number): string | null {
  return escenario.pasos[pasoIndex]?.objeto_3d_asociado ?? null
}
