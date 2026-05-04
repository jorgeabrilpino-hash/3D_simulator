import { create } from 'zustand'

import { calcularResultado, evaluarRespuesta } from '@/engine/gameEngine'
import { generarFeedback } from '@/engine/feedbackEngine'
import type { Escenario, RespuestaUsuario, ResultadoSimulacion } from '@/engine/types'

interface LastFeedback {
  texto: string
  normativa: string
  correcto: boolean
  puntosPerdidos: number
}

interface SimulatorState {
  escenario: Escenario | null
  currentStep: number
  respuestas: RespuestaUsuario[]
  resultado: ResultadoSimulacion | null
  isLocked: boolean
  showFeedback: boolean
  lastFeedback: LastFeedback | null
  startTimestamp: number | null
  elapsedSeconds: number

  loadEscenario: (escenario: Escenario) => void
  selectObject: (opcion_id: string) => void
  setElapsedSeconds: (seconds: number) => void
  nextStep: () => void
  resetSimulador: () => void
}

export const useSimulatorStore = create<SimulatorState>((set, get) => ({
  escenario: null,
  currentStep: 0,
  respuestas: [],
  resultado: null,
  isLocked: false,
  showFeedback: false,
  lastFeedback: null,
  startTimestamp: null,
  elapsedSeconds: 0,

  loadEscenario: (escenario) =>
    set({
      escenario,
      currentStep: 0,
      respuestas: [],
      resultado: null,
      isLocked: false,
      showFeedback: false,
      lastFeedback: null,
      startTimestamp: Date.now(),
      elapsedSeconds: 0,
    }),

  selectObject: (opcion_id) => {
    const { escenario, currentStep, respuestas, isLocked, elapsedSeconds } = get()
    if (!escenario || isLocked) return

    const paso = escenario.pasos[currentStep]
    if (!paso) return

    const opcion =
      paso.opciones.find((item) => item.id === opcion_id) ??
      (paso.objeto_3d_asociado === opcion_id
        ? paso.opciones.find((item) => item.es_correcta)
        : undefined)
    if (!opcion) return

    const evaluacion = evaluarRespuesta(escenario, paso.id, opcion.id)
    const feedback = generarFeedback(paso, opcion)
    const nuevaRespuesta: RespuestaUsuario = {
      paso_id: paso.id,
      opcion_id: opcion.id,
      es_correcta: evaluacion.es_correcta,
      puntaje_obtenido: evaluacion.puntaje,
      timestamp: Date.now(),
    }
    const nuevasRespuestas = [...respuestas, nuevaRespuesta]
    const esUltimoPaso = currentStep === escenario.pasos.length - 1

    set({
      respuestas: nuevasRespuestas,
      showFeedback: true,
      isLocked: true,
      lastFeedback: {
        texto: feedback.texto,
        normativa: feedback.normativa,
        correcto: feedback.esCorrecta,
        puntosPerdidos: feedback.puntosPerdidos,
      },
      resultado: esUltimoPaso ? calcularResultado(escenario, nuevasRespuestas, elapsedSeconds) : null,
    })
  },

  setElapsedSeconds: (seconds) => set({ elapsedSeconds: seconds }),

  nextStep: () =>
    set((state) => ({
      currentStep: state.resultado ? state.currentStep : state.currentStep + 1,
      showFeedback: false,
      isLocked: false,
    })),

  resetSimulador: () =>
    set({
      currentStep: 0,
      respuestas: [],
      resultado: null,
      isLocked: false,
      showFeedback: false,
      lastFeedback: null,
      startTimestamp: Date.now(),
      elapsedSeconds: 0,
    }),
}))
