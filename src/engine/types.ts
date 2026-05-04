export interface Opcion {
  id: string
  texto: string
  es_correcta: boolean
  puntaje: number
  error_tipo?: string
}

export interface Paso {
  id: string
  orden: number
  pregunta: string
  opciones: Opcion[]
  feedback_correcto: string
  feedback_incorrecto: string
  normativa_ref: string
  objeto_3d_asociado: string | null
}

export interface Escenario {
  id: string
  titulo: string
  descripcion: string
  clase_onu: number
  sustancia_ejemplo: string
  puntaje_aprobatorio: number
  pasos: Paso[]
}

export interface RespuestaUsuario {
  paso_id: string
  opcion_id: string
  es_correcta: boolean
  puntaje_obtenido: number
  timestamp: number
}

export interface ResultadoSimulacion {
  escenario_id: string
  respuestas: RespuestaUsuario[]
  puntaje_total: number
  puntaje_maximo: number
  porcentaje: number
  aprobado: boolean
  tiempo_total_segundos: number
  fecha: string
}
