import type { DecisionPool, SelectedDecision } from './types'

export type TipoRonda = 'A' | 'B' | 'C' | 'D'

const SECUENCIA_RONDAS: TipoRonda[] = ['A', 'B', 'C', 'D']
let runCount = 0

export function getTipoRondaActual(): TipoRonda {
  return SECUENCIA_RONDAS[runCount % SECUENCIA_RONDAS.length]
}

export function incrementarRun(): void {
  runCount += 1
}

export function resetRunCount(): void {
  runCount = 0
}

/**
 * Selecciona exactamente 2 opciones segun el tipo de ronda:
 * A = optima + correcta
 * B = correcta + incorrecta_leve
 * C = optima + incorrecta_grave
 * D = correcta + incorrecta_grave
 */
export function seleccionarDosOpciones(pool: DecisionPool[]): [DecisionPool, DecisionPool] {
  const tipo = getTipoRondaActual()

  const optimas = pool.filter((decision) => decision.nivel === 'optima')
  const correctas = pool.filter((decision) => decision.nivel === 'correcta')
  const leves = pool.filter((decision) => decision.nivel === 'incorrecta_leve')
  const graves = pool.filter((decision) => decision.nivel === 'incorrecta_grave')

  let opcion1: DecisionPool | undefined
  let opcion2: DecisionPool | undefined

  switch (tipo) {
    case 'A':
      opcion1 = pickRandom(optimas) ?? pickRandom(correctas)
      opcion2 =
        pickRandom(correctas.filter((decision) => decision.id !== opcion1?.id)) ??
        pickRandom(optimas.filter((decision) => decision.id !== opcion1?.id))
      break

    case 'B':
      opcion1 = pickRandom(correctas) ?? pickRandom(optimas)
      opcion2 =
        pickRandom(leves.filter((decision) => decision.id !== opcion1?.id)) ??
        pickRandom(correctas.filter((decision) => decision.id !== opcion1?.id))
      break

    case 'C':
      opcion1 = pickRandom(optimas) ?? pickRandom(correctas)
      opcion2 =
        pickRandom(graves.filter((decision) => decision.id !== opcion1?.id)) ??
        pickRandom(leves.filter((decision) => decision.id !== opcion1?.id))
      break

    case 'D':
      opcion1 = pickRandom(correctas) ?? pickRandom(optimas)
      opcion2 =
        pickRandom(graves.filter((decision) => decision.id !== opcion1?.id)) ??
        pickRandom(leves.filter((decision) => decision.id !== opcion1?.id))
      break
  }

  if (!opcion1 || !opcion2 || opcion1.id === opcion2.id) {
    const distintas = pool.filter((decision, index, all) => {
      return all.findIndex((item) => item.id === decision.id) === index
    })
    return [distintas[0], distintas[1]]
  }

  return Math.random() > 0.5 ? [opcion1, opcion2] : [opcion2, opcion1]
}

function pickRandom<T>(arr: T[]): T | undefined {
  if (!arr || arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

export function debesMostrarFeedback(decision: DecisionPool): boolean {
  return decision.nivel_error === 'leve' && !!decision.feedback_contextual
}

export function formatearParaUI(decisions: [DecisionPool, DecisionPool]): SelectedDecision[] {
  return decisions.map((decision, index) => ({
    id: decision.id,
    texto: decision.texto_opcion,
    letra: index === 0 ? 'A' : 'B',
    objeto_3d_id: decision.objeto_3d_id,
  }))
}
