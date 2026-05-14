import escena1 from '../src/data/decisions/escena1.json'
import escena2 from '../src/data/decisions/escena2.json'
import escena3 from '../src/data/decisions/escena3.json'
import escena4 from '../src/data/decisions/escena4.json'
import escena5 from '../src/data/decisions/escena5.json'
import escena6 from '../src/data/decisions/escena6.json'
import {
  getTipoRondaActual,
  incrementarRun,
  resetRunCount,
  seleccionarDosOpciones,
} from '../src/engine/decisionSelector'
import { applyAction, evaluarTransicion, initialWorldState } from '../src/engine/worldState'

type TestResult = { nombre: string; ok: boolean; detalle?: string }
type DecisionJson = {
  nivel: string
  nivel_error: string | null
  feedback_contextual: string | null
}
type EscenaJson = { pool_decisiones: DecisionJson[] }

const resultados: TestResult[] = []
const escenas = [escena1, escena2, escena3, escena4, escena5, escena6] as unknown as EscenaJson[]

function test(nombre: string, fn: () => boolean, detalle?: string) {
  try {
    const ok = fn()
    resultados.push({ nombre, ok, detalle })
  } catch (error) {
    resultados.push({ nombre, ok: false, detalle: String(error) })
  }
}

test('Siempre selecciona exactamente 2 opciones', () => {
  const [a, b] = seleccionarDosOpciones(escena1.pool_decisiones as any)
  return Boolean(a && b && a.id !== b.id)
})

test('Nunca selecciona 2 opciones graves juntas', () => {
  for (let i = 0; i < 100; i++) {
    const [a, b] = seleccionarDosOpciones(escena1.pool_decisiones as any)
    if (a.nivel_error === 'grave' && b.nivel_error === 'grave') return false
  }
  return true
})

test('Opciones cambian entre runs', () => {
  const resultadosSets = new Set<string>()
  for (let i = 0; i < 20; i++) {
    const [a, b] = seleccionarDosOpciones(escena1.pool_decisiones as any)
    resultadosSets.add(`${a.id}-${b.id}`)
  }
  return resultadosSets.size > 1
})

test('Selector alterna rondas A/B/C/D al reiniciar', () => {
  resetRunCount()
  const rondas = [getTipoRondaActual()]
  for (let i = 0; i < 3; i++) {
    incrementarRun()
    rondas.push(getTipoRondaActual())
  }
  return rondas.join('') === 'ABCD'
})

test('worldState inicial tiene fuga_pct = 5', () => {
  return initialWorldState.fuga_pct === 5
})

test('Error grave incrementa errores_criticos', () => {
  const accionGrave = escena1.pool_decisiones.find((decision) => decision.nivel_error === 'grave')
  if (!accionGrave) return false
  const siguiente = applyAction(initialWorldState, accionGrave as any)
  return siguiente.errores_criticos > initialWorldState.errores_criticos
})

test('Error leve incrementa fuga_pct', () => {
  const accionLeve = escena1.pool_decisiones.find((decision) => decision.nivel_error === 'leve')
  if (!accionLeve) return false
  const siguiente = applyAction(initialWorldState, accionLeve as any)
  return siguiente.fuga_pct > initialWorldState.fuga_pct
})

test('Accion correcta no penaliza worldState', () => {
  const accionOk = escena1.pool_decisiones.find((decision) => decision.nivel === 'optima')
  if (!accionOk) return false
  const siguiente = applyAction(initialWorldState, accionOk as any)
  return siguiente.errores_criticos === 0 && siguiente.fuga_pct <= initialWorldState.fuga_pct
})

test('3 errores criticos activa trigger_fallo', () => {
  const accionGrave = escena1.pool_decisiones.find((decision) => decision.nivel_error === 'grave')
  if (!accionGrave) return false
  const estado = { ...initialWorldState, errores_criticos: 2 }
  const siguiente = applyAction(estado, accionGrave as any)
  return siguiente.trigger_fallo !== null
})

test('Timeout en escena_1 activa escena_F_A', () => {
  const estado = { ...initialWorldState, escena_actual: 'escena_1' as const }
  const destino = evaluarTransicion(estado, 301)
  return destino === 'escena_F_A'
})

test('llamo_116=true permite avanzar a escena_3', () => {
  const estado = {
    ...initialWorldState,
    escena_actual: 'escena_2' as const,
    llamo_116: true,
  }
  const destino = evaluarTransicion(estado, 0)
  return destino === 'escena_3'
})

test('Cada escena tiene al menos 8 opciones en el pool', () => {
  return escenas.every((escena) => escena.pool_decisiones.length >= 8)
})

test('Escenas 4 a 6 tienen 2 optimas, 3 correctas, 2 leves y 1 grave', () => {
  const escenasFinales = [escena4, escena5, escena6] as unknown as EscenaJson[]
  return escenasFinales.every((escena) => {
    const counts = escena.pool_decisiones.reduce<Record<string, number>>((acc, decision) => {
      acc[decision.nivel] = (acc[decision.nivel] ?? 0) + 1
      return acc
    }, {})
    return (
      counts.optima === 2 &&
      counts.correcta === 3 &&
      counts.incorrecta_leve === 2 &&
      counts.incorrecta_grave === 1
    )
  })
})

test('Todas las opciones leves tienen feedback_contextual', () => {
  const todas = escenas.flatMap((escena) => escena.pool_decisiones)
  return todas.every(
    (decision) => decision.nivel_error !== 'leve' || Boolean(decision.feedback_contextual),
  )
})

test('Ninguna opcion grave tiene feedback_contextual', () => {
  const todas = escenas.flatMap((escena) => escena.pool_decisiones)
  return todas.every((decision) => decision.nivel_error !== 'grave' || decision.feedback_contextual === null)
})

console.log('\n========================================')
console.log('  ChemSim Peru - Test Suite')
console.log('========================================\n')

let pasaron = 0
let fallaron = 0

resultados.forEach((resultado) => {
  const icono = resultado.ok ? '[OK]' : '[FAIL]'
  console.log(`${icono} ${resultado.nombre}`)
  if (!resultado.ok && resultado.detalle) console.log(`  -> ${resultado.detalle}`)
  if (resultado.ok) pasaron++
  else fallaron++
})

console.log('\n----------------------------------------')
console.log(`  ${pasaron} pasaron | ${fallaron} fallaron`)
console.log('========================================\n')

if (fallaron > 0) process.exit(1)
