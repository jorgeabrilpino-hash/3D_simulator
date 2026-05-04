interface BarraProgresoProps {
  pasoActual: number
  totalPasos: number
}

export function BarraProgreso({ pasoActual, totalPasos }: BarraProgresoProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {Array.from({ length: totalPasos }, (_, index) => {
          const completado = index < pasoActual
          const actual = index === pasoActual
          const estadoClase = completado
            ? 'border-success bg-success text-black'
            : actual
              ? 'animate-pulse border-accent bg-accent text-black'
              : 'border-muted bg-muted text-zinc-300'

          return (
            <div key={index} className="flex flex-1 items-center last:flex-none">
              <div
                className={`flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${estadoClase}`}
                aria-current={actual ? 'step' : undefined}
              >
                {completado ? '✓' : index + 1}
              </div>
              {index < totalPasos - 1 && (
                <div className={`h-1 flex-1 ${index < pasoActual ? 'bg-success' : 'bg-muted'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
