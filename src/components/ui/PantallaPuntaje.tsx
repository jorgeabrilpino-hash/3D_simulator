'use client'

import { motion } from 'framer-motion'

import escena1 from '@/data/decisions/escena1.json'
import escena2 from '@/data/decisions/escena2.json'
import escena3 from '@/data/decisions/escena3.json'
import escena4 from '@/data/decisions/escena4.json'
import escena5 from '@/data/decisions/escena5.json'
import escena6 from '@/data/decisions/escena6.json'
import { useSimulatorStore } from '@/store/simulatorStore'

const COLORES_ESCENA: Record<string, string> = {
  escena_1: '#f97316',
  escena_2: '#eab308',
  escena_3: '#8b5cf6',
  escena_4: '#3b82f6',
  escena_5: '#f43f5e',
  escena_6: '#22c55e',
  fin_exitoso: '#22c55e',
  escena_F_A: '#ef4444',
  escena_F_B: '#ef4444',
  escena_F_C: '#ef4444',
}

const NOMBRES_ESCENA: Record<string, string> = {
  escena_1: 'Deteccion de la fuga',
  escena_2: 'Identificacion y respuesta',
  escena_3: 'Espera y coordinacion',
  escena_4: 'Llegada de autoridades',
  escena_5: 'Control del derrame',
  escena_6: 'Cierre y documentacion',
  fin_exitoso: 'Simulacion completada',
  escena_F_A: 'Fallo - timeout de deteccion',
  escena_F_B: 'Fallo - errores acumulados',
  escena_F_C: 'Fallo - accion critica',
}

const ESCENAS_PRINCIPALES = ['escena_1', 'escena_2', 'escena_3', 'escena_4', 'escena_5', 'escena_6'] as const

function formatTotalTime(seconds?: number) {
  if (seconds === undefined) return '--'
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
}

const DECISION_LABELS = Object.fromEntries(
  [escena1, escena2, escena3, escena4, escena5, escena6].flatMap((escena) =>
    escena.pool_decisiones.map((decision) => [decision.id, decision.texto_opcion]),
  ),
) as Record<string, string>

export function PantallaPuntaje() {
  const resultado = useSimulatorStore((state) => state.resultado)
  const worldState = useSimulatorStore((state) => state.worldState)
  const resetSimulador = useSimulatorStore((state) => state.resetSimulador)

  const esFallo = resultado?.trigger_fallo !== null && resultado?.trigger_fallo !== undefined
  const camino = resultado?.camino_tomado ?? worldState.historial_escenas
  const escenasCompletadas = new Set(
    camino.filter((escena) => /^escena_[1-6]$/.test(escena)),
  ).size
  const completoSeisEscenas =
    !esFallo &&
    camino.includes('fin_exitoso') &&
    ESCENAS_PRINCIPALES.every((escena) =>
      camino.includes(escena),
    )
  const accionesTomadas = resultado?.acciones_ejecutadas ?? []

  return (
    <div className="relative z-20 flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-6 py-12 text-white">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-orange-400">Simulacion finalizada</p>
        <h1 className={`mb-2 text-4xl font-bold ${esFallo ? 'text-red-400' : 'text-white'}`}>
          {esFallo ? 'Protocolo incumplido' : 'Protocolo completado'}
        </h1>
        <p className="text-sm text-gray-400">
          {esFallo
            ? 'Tu camino de decisiones derivo en un fallo catastrofico'
            : 'Completaste el simulador de emergencias DS 021-2008-MTC'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-10 w-full max-w-2xl"
      >
        <p className="mb-4 text-center text-xs uppercase tracking-widest text-gray-500">Camino tomado</p>
        <div className="flex flex-wrap justify-center gap-2">
          {camino.map((escena, i) => (
            <motion.div
              key={`${escena}-${i}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2"
            >
              <div
                className="rounded-lg border px-3 py-2 text-xs font-medium"
                style={{
                  borderColor: `${COLORES_ESCENA[escena] ?? '#94a3b8'}66`,
                  color: COLORES_ESCENA[escena] ?? '#94a3b8',
                  backgroundColor: `${COLORES_ESCENA[escena] ?? '#94a3b8'}11`,
                }}
              >
                {NOMBRES_ESCENA[escena] ?? escena}
              </div>
              {i < camino.length - 1 ? <span className="text-xs text-gray-700">-&gt;</span> : null}
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="mb-8 w-full max-w-2xl rounded-xl border border-white/10 bg-white/5 p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Resultado del flujo</p>
            <p className="text-sm text-gray-200">
              {completoSeisEscenas
                ? 'Completaste las 6 escenas y cerraste el protocolo.'
                : `Llegaste a ${escenasCompletadas} de 6 escenas antes del cierre o fallo.`}
            </p>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">Errores registrados</p>
            <p className="text-sm text-gray-200">
              {worldState.errores_criticos} criticos y {worldState.errores_leves} leves
            </p>
          </div>
        </div>

        {accionesTomadas.length > 0 ? (
          <div className="mt-5">
            <p className="mb-3 text-xs uppercase tracking-wider text-gray-500">Decisiones tomadas</p>
            <ol className="space-y-2 text-sm text-gray-300">
              {accionesTomadas.map((accionId, index) => (
                <li key={`${accionId}-${index}`} className="leading-relaxed">
                  {index + 1}. {DECISION_LABELS[accionId] ?? accionId}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mb-10 grid w-full max-w-2xl gap-4 sm:grid-cols-4"
      >
        {[
          {
            label: 'Liquido derramado',
            value: `${Math.round(worldState.fuga_pct * 100).toLocaleString()}L`,
            color: worldState.fuga_pct > 50 ? '#ef4444' : '#f97316',
          },
          {
            label: 'Errores criticos',
            value: `${worldState.errores_criticos} / 3`,
            color: worldState.errores_criticos >= 2 ? '#ef4444' : '#22c55e',
          },
          {
            label: 'Errores leves',
            value: `${worldState.errores_leves}`,
            color: worldState.errores_leves > 0 ? '#eab308' : '#22c55e',
          },
          {
            label: 'Tiempo total',
            value: formatTotalTime(resultado?.tiempo_total_seg),
            color: '#94a3b8',
          },
        ].map((metrica) => (
          <div key={metrica.label} className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="mb-2 text-xs uppercase tracking-wider text-gray-500">{metrica.label}</p>
            <p className="font-mono text-2xl font-bold" style={{ color: metrica.color }}>
              {metrica.value}
            </p>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="flex gap-4">
        <button
          type="button"
          onClick={resetSimulador}
          className="rounded-xl bg-orange-500 px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:scale-105 hover:bg-orange-400"
        >
          Intentar de nuevo
        </button>
        <button
          type="button"
          onClick={() => {
            window.location.href = '/'
          }}
          className="rounded-xl border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white transition-all duration-200 hover:bg-white/15"
        >
          Volver al inicio
        </button>
      </motion.div>
    </div>
  )
}
