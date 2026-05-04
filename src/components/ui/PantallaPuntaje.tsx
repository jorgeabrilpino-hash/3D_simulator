'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

import { motion } from 'framer-motion'

import { exportarResultadoJSON, formatearTiempo, generarTextoCompartir } from '@/lib/reportUtils'
import { useSimulatorStore } from '@/store/simulatorStore'

const confetti = Array.from({ length: 24 }, (_, index) => index)

export function PantallaPuntaje() {
  const escenario = useSimulatorStore((state) => state.escenario)
  const resultado = useSimulatorStore((state) => state.resultado)
  const resetSimulador = useSimulatorStore((state) => state.resetSimulador)
  const [puntajeAnimado, setPuntajeAnimado] = useState(0)
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    if (!resultado) return

    const inicio = performance.now()
    const duracion = 1500
    let frameId = 0

    const tick = (ahora: number) => {
      const progreso = Math.min((ahora - inicio) / duracion, 1)
      setPuntajeAnimado(Math.round(resultado.puntaje_total * progreso))
      if (progreso < 1) {
        frameId = requestAnimationFrame(tick)
      }
    }

    frameId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frameId)
  }, [resultado])

  useEffect(() => {
    if (!copiado) return
    const timeout = window.setTimeout(() => setCopiado(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copiado])

  if (!escenario || !resultado) return null

  const handleCompartir = async () => {
    await navigator.clipboard.writeText(generarTextoCompartir(resultado))
    setCopiado(true)
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-6 py-8 text-foreground">
      {resultado.aprobado && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {confetti.map((item) => (
            <span
              key={item}
              className="absolute top-[-1rem] size-2 animate-[confetti_2.4s_linear_infinite]"
              style={{
                left: `${(item * 37) % 100}%`,
                animationDelay: `${(item % 8) * 0.14}s`,
                backgroundColor: ['#22c55e', '#f97316', '#eab308', '#ffffff'][item % 4],
              }}
            />
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translate3d(0, -1rem, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate3d(2rem, 110vh, 0) rotate(540deg);
            opacity: 0;
          }
        }
      `}</style>

      <div className="relative z-10 mx-auto max-w-4xl">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-muted bg-zinc-950 p-8 text-center shadow-xl shadow-black/30"
        >
          <p className="text-sm font-semibold uppercase tracking-wide text-accent">Resultado final</p>
          <h1 className="mt-4 text-6xl font-bold">
            {puntajeAnimado} / {resultado.puntaje_maximo}
          </h1>
          <div
            className={`mx-auto mt-5 inline-flex rounded px-4 py-2 text-sm font-bold uppercase ${
              resultado.aprobado ? 'bg-success text-black' : 'bg-error text-white'
            }`}
          >
            {resultado.aprobado ? 'APROBADO ✓' : 'REPROBADO ✕'}
          </div>
          <p className="mt-4 text-zinc-300">
            Tiempo de la simulación: {formatearTiempo(resultado.tiempo_total_segundos)}
          </p>
        </motion.section>

        <section className="mt-6 rounded-lg border border-muted bg-zinc-950 p-5">
          <h2 className="text-xl font-semibold">Detalle normativo</h2>
          <motion.div initial="hidden" animate="show" className="mt-4 grid gap-3">
            {escenario.pasos.map((paso, index) => {
              const respuesta = resultado.respuestas.find((item) => item.paso_id === paso.id)
              return (
                <motion.article
                  key={paso.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0, transition: { delay: index * 0.1 } },
                  }}
                  className="rounded border border-muted bg-background p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className={respuesta?.es_correcta ? 'text-success' : 'text-error'}>
                      {respuesta?.es_correcta ? '✓' : '✕'}
                    </span>
                    <div>
                      <h3 className="font-semibold">
                        Paso {paso.orden}: {paso.pregunta}
                      </h3>
                      <p className="mt-1 text-sm italic text-zinc-400">{paso.normativa_ref}</p>
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        </section>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={resetSimulador}
            className="inline-flex min-h-11 items-center justify-center rounded bg-accent px-5 py-2 font-semibold text-black transition hover:bg-orange-400"
          >
            Intentar de nuevo
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded border border-muted px-5 py-2 font-semibold text-zinc-100 transition hover:border-accent"
          >
            Volver al inicio
          </Link>
          <button
            type="button"
            onClick={() => exportarResultadoJSON(resultado)}
            className="inline-flex min-h-11 items-center justify-center rounded border border-muted px-5 py-2 font-semibold text-zinc-100 transition hover:border-accent"
          >
            Descargar reporte
          </button>
          <button
            type="button"
            onClick={handleCompartir}
            className="inline-flex min-h-11 items-center justify-center rounded border border-muted px-5 py-2 font-semibold text-zinc-100 transition hover:border-accent"
          >
            {copiado ? '¡Copiado!' : 'Compartir'}
          </button>
        </div>
      </div>
    </main>
  )
}
