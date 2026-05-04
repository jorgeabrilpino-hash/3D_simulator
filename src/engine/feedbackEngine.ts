import type { Opcion, Paso } from './types'

export interface FeedbackResult {
  texto: string
  normativa: string
  esCorrecta: boolean
  puntosPerdidos: number
}

export function generarFeedback(paso: Paso, opcionElegida: Opcion): FeedbackResult {
  return {
    texto: opcionElegida.es_correcta ? paso.feedback_correcto : paso.feedback_incorrecto,
    normativa: paso.normativa_ref,
    esCorrecta: opcionElegida.es_correcta,
    puntosPerdidos: opcionElegida.es_correcta ? 0 : 20 - opcionElegida.puntaje,
  }
}
