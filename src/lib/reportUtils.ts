import type { ResultadoSimulacion } from '@/engine/types'

export function exportarResultadoJSON(resultado: ResultadoSimulacion): void {
  const blob = new Blob([JSON.stringify(resultado, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chemsim-${resultado.escenario_id}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function generarTextoCompartir(resultado: ResultadoSimulacion): string {
  const estado = resultado.aprobado ? '✓ Aprobado' : '✕ Reprobado'
  const modo = resultado.escenario_id.toUpperCase().replace('MODO', 'Modo ')
  return `ChemSim Perú — ${modo} — ${resultado.porcentaje}/100 ${estado} | Capacitación DS 021-2008-MTC`
}

export function formatearTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${m}m ${s.toString().padStart(2, '0')}s`
}
