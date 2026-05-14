"use client"

import { useEffect, useState, useCallback, type ReactNode } from "react"
import { motion } from "framer-motion"

type IconProps = {
  className?: string
  strokeWidth?: number
}

function IconBase({
  className,
  strokeWidth = 2,
  children,
}: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

function AlertTriangle(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M12 3 22 20H2L12 3Z" />
      <path d="M12 9v5" />
      <path d="M12 17h.01" />
    </IconBase>
  )
}

function FileText(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M6 2h9l5 5v15H6z" />
      <path d="M14 2v6h6" />
      <path d="M9 13h6" />
      <path d="M9 17h6" />
    </IconBase>
  )
}

function Clock(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </IconBase>
  )
}

function XCircle(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </IconBase>
  )
}

function CheckCircle2(props: IconProps) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </IconBase>
  )
}

function RotateCcw(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v6h6" />
    </IconBase>
  )
}

function BookOpen(props: IconProps) {
  return (
    <IconBase {...props}>
      <path d="M4 5c2 0 4 .5 6 2v13c-2-1.5-4-2-6-2z" />
      <path d="M20 5c-2 0-4 .5-6 2v13c2-1.5 4-2 6-2z" />
    </IconBase>
  )
}

interface WorldStateFinal {
  fuga_pct: number
  errores_criticos: number
  tiempo_total_seg: number
}

interface EscenaFVisualProps {
  version: "A" | "B" | "C"
  triggerDescription: string
  worldStateFinal: WorldStateFinal
  onRetry?: () => void
  onViewProtocol?: () => void
}

// Violation data per version
const VIOLATIONS: Record<"A" | "B" | "C", { code: string; article: string; description: string }[]> = {
  A: [
    { code: "DS 021-2008-MTC", article: "Art. 156", description: "No se detecto ni reporto oportunamente la fuga durante la inspeccion inicial" },
    { code: "DS 021-2008-MTC", article: "Art. 160", description: "Se omitieron acciones inmediatas de seguridad ante una emergencia en ruta" },
    { code: "Libro Naranja ONU", article: "Seccion 5.3.2", description: "No se uso la identificacion ONU 1830 para orientar la respuesta inicial" },
  ],
  B: [
    { code: "DS 021-2008-MTC", article: "Art. 48", description: "Se intento intervenir o manipular material peligroso sin condiciones seguras" },
    { code: "DS 021-2008-MTC", article: "Art. 160", description: "No se priorizo la llamada al 116 ni la senalizacion de la emergencia" },
    { code: "Libro Naranja ONU", article: "Guia Clase 8", description: "Se aplicaron respuestas incompatibles frente a acido sulfurico ONU 1830" },
  ],
  C: [
    { code: "DS 021-2008-MTC", article: "Art. 160", description: "Se abandono o desatendio una unidad con fuga activa" },
    { code: "DS 021-2008-MTC", article: "Art. 160", description: "No se mantuvo protegido el perimetro frente a terceros expuestos" },
    { code: "DS 021-2008-MTC", article: "Art. 48", description: "Se intento una reparacion improvisada sin control especializado" },
  ],
}

const CORRECT_ACTIONS: Record<"A" | "B" | "C", string[]> = {
  A: [
    "Inspeccionar visualmente, leer Kemler/ONU 1830 y confirmar la fuga antes de avanzar",
    "Apagar el motor y mantenerse en posicion segura segun el viento",
    "Activar el protocolo antes de que el tiempo de deteccion supere 5 minutos",
  ],
  B: [
    "Llamar al 116 informando acido sulfurico ONU 1830",
    "Colocar triangulos y mantener el perimetro de seguridad",
    "Evitar agua, CO2 y manipulacion de valvula sin EPP ni apoyo especializado",
  ],
  C: [
    "Permanecer en zona segura hasta que lleguen servicios de emergencia",
    "Alejar al civil en peligro sin abandonar la supervision del incidente",
    "Preparar SDS, rutas y notificacion DGAAM para la coordinacion final",
  ],
}

// Estimate liters based on fuga_pct and time
function estimateLitersSpilled(fugaPct: number, tiempoSeg: number): number {
  // Assume tank capacity 20,000L, leak rate proportional to fugaPct
  const maxLeakRatePerSec = 2.5 // liters per second at 100%
  const avgLeakRate = (fugaPct / 100) * maxLeakRatePerSec
  return Math.round(avgLeakRate * tiempoSeg)
}

// Estimate contaminated area (m²) based on liters
function estimateContaminatedArea(liters: number): number {
  // Rough estimate: 1 liter spreads ~0.8 m² on asphalt
  return Math.round(liters * 0.8)
}

// Estimate remediation cost (educational reference)
function estimateRemediationCost(areaM2: number): number {
  // Reference: ~S/ 150-250 per m2 for corrosive spill cleanup
  return Math.round(areaM2 * 180)
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Animated counter hook
function useAnimatedCounter(target: number, duration: number = 2000): number {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(target * eased))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [target, duration])

  return value
}

// Stagger animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const pulseVariants = {
  initial: { scale: 1, opacity: 0.8 },
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
}

export default function EscenaFVisual({
  version,
  triggerDescription,
  worldStateFinal,
  onRetry,
  onViewProtocol,
}: EscenaFVisualProps) {
  const litersSpilled = estimateLitersSpilled(worldStateFinal.fuga_pct, worldStateFinal.tiempo_total_seg)
  const contaminatedArea = estimateContaminatedArea(litersSpilled)
  const remediationCost = estimateRemediationCost(contaminatedArea)

  const animatedLiters = useAnimatedCounter(litersSpilled, 2500)
  const animatedArea = useAnimatedCounter(contaminatedArea, 2800)
  const animatedCost = useAnimatedCounter(remediationCost, 3000)

  const violations = VIOLATIONS[version]
  const correctActions = CORRECT_ACTIONS[version]

  const handleRetry = useCallback(() => {
    onRetry?.()
  }, [onRetry])

  const handleViewProtocol = useCallback(() => {
    onViewProtocol?.()
  }, [onViewProtocol])

  return (
    <div className="min-h-screen w-full bg-[#0a0a0a] text-white overflow-y-auto">
      <motion.div
        className="max-w-4xl mx-auto px-6 py-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header with warning */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <motion.div
            variants={pulseVariants}
            initial="initial"
            animate="animate"
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-950/50 mb-6"
          >
            <AlertTriangle className="w-14 h-14 text-red-500" strokeWidth={2} />
          </motion.div>
          <h1 className="text-4xl font-bold text-red-500 tracking-tight mb-2">
            SIMULACIÓN FALLIDA
          </h1>
          <p className="text-neutral-500 text-lg">
            Escenario {version} — Respuesta de emergencia incorrecta
          </p>
        </motion.div>

        {/* Animated liters counter */}
        <motion.div variants={itemVariants} className="text-center mb-10">
          <div className="text-6xl font-mono font-bold text-red-400 tabular-nums">
            {animatedLiters.toLocaleString("es-PE")}
          </div>
          <div className="text-neutral-400 mt-2 text-lg">litros de acido sulfurico derramados</div>
        </motion.div>

        {/* Impact data cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="text-neutral-500 text-sm mb-1">Área contaminada</div>
            <div className="text-2xl font-mono font-semibold text-neutral-200 tabular-nums">
              {animatedArea.toLocaleString("es-PE")} m²
            </div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="text-neutral-500 text-sm mb-1">Costo estimado de remediación</div>
            <div className="text-2xl font-mono font-semibold text-neutral-200 tabular-nums">
              {formatCurrency(animatedCost)}
            </div>
            <div className="text-neutral-600 text-xs mt-1">Referencia educativa</div>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
            <div className="text-neutral-500 text-sm mb-1">Tiempo transcurrido</div>
            <div className="text-2xl font-mono font-semibold text-neutral-200 tabular-nums">
              {formatTime(worldStateFinal.tiempo_total_seg)}
            </div>
            <div className="text-neutral-600 text-xs mt-1">
              {worldStateFinal.errores_criticos} error{worldStateFinal.errores_criticos !== 1 ? "es" : ""} crítico{worldStateFinal.errores_criticos !== 1 ? "s" : ""}
            </div>
          </div>
        </motion.div>

        {/* Timeline - trigger decision */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-300">Decisión que activó el fallo</h2>
          </div>
          <div className="relative pl-6 border-l-2 border-red-800">
            <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-red-500" />
            <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-4">
              <div className="text-red-400 font-medium mb-1">Acción crítica incorrecta</div>
              <div className="text-neutral-300">{triggerDescription}</div>
            </div>
          </div>
        </motion.div>

        {/* Normative violations */}
        <motion.div variants={itemVariants} className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-300">Violaciones normativas</h2>
          </div>
          <div className="space-y-3">
            {violations.map((violation, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-neutral-900/50 border border-neutral-800 rounded-lg p-4"
              >
                <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-neutral-300">{violation.description}</div>
                  <div className="text-neutral-500 text-sm mt-1">
                    {violation.code} — {violation.article}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* What you should have done */}
        <motion.div variants={itemVariants} className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-neutral-500" />
            <h2 className="text-lg font-semibold text-neutral-300">Qué debiste hacer diferente</h2>
          </div>
          <div className="space-y-3">
            {correctActions.map((action, index) => (
              <div
                key={index}
                className="flex items-start gap-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-4"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-900/50 text-emerald-400 text-sm font-medium flex items-center justify-center flex-shrink-0">
                  {index + 1}
                </div>
                <div className="text-neutral-300">{action}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white font-medium rounded-lg transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Intentar de nuevo
          </button>
          <button
            onClick={handleViewProtocol}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium rounded-lg transition-colors border border-neutral-700"
          >
            <BookOpen className="w-5 h-5" />
            Ver protocolo correcto
          </button>
        </motion.div>

        {/* Footer disclaimer */}
        <motion.div variants={itemVariants} className="mt-12 text-center">
          <p className="text-neutral-600 text-sm">
            Esta simulación tiene fines educativos. Los valores mostrados son estimaciones de referencia.
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
