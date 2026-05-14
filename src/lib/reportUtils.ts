import type { ResultadoSimulacion } from '@/engine/types'

export function exportarResultadoJSON(resultado: ResultadoSimulacion): void {
  const blob = new Blob([JSON.stringify(resultado, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chemsim-${resultado.camino_tomado.join('-')}-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function generarTextoCompartir(resultado: ResultadoSimulacion): string {
  const estado = resultado.aprobado ? 'Aprobado' : 'Reprobado'
  return `ChemSim Peru - ${resultado.porcentaje}/100 ${estado} | Capacitacion DS 021-2008-MTC`
}

export function formatearTiempo(segundos: number): string {
  const minutes = Math.floor(segundos / 60)
  const seconds = segundos % 60
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`
}
