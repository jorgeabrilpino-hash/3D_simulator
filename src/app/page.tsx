import Link from 'next/link'

const modos = [
  {
    id: 'modo1a',
    titulo: 'Modo 1A',
    descripcion: 'Fuga en ruta',
    clase: 'Clase 3',
    disponible: true,
  },
  {
    id: 'modo1b',
    titulo: 'Modo 1B',
    descripcion: 'Terminal de carga',
    clase: 'Clase 2',
    disponible: false,
  },
  {
    id: 'modo2a',
    titulo: 'Modo 2A',
    descripcion: 'Tanque estático',
    clase: 'Clase 8',
    disponible: false,
  },
  {
    id: 'modo2b',
    titulo: 'Modo 2B',
    descripcion: 'Emergencia mayor',
    clase: 'Multi-clase',
    disponible: false,
  },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background px-6 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col">
        <header className="border-b border-muted pb-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              ⚠️
            </span>
            <h1 className="text-3xl font-bold tracking-normal md:text-4xl">ChemSim Perú</h1>
          </div>
          <p className="mt-3 max-w-2xl text-base text-zinc-300 md:text-lg">
            Simulador oficial de capacitación en materiales peligrosos
          </p>
        </header>

        <section className="grid flex-1 content-center gap-4 py-10 md:grid-cols-2">
          {modos.map((modo) => (
            <article
              key={modo.id}
              className="rounded-lg border border-muted bg-zinc-950 p-6 shadow-lg shadow-black/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">{modo.titulo}</h2>
                  <p className="mt-2 text-lg text-zinc-200">{modo.descripcion}</p>
                  <p className="mt-1 text-sm uppercase tracking-wide text-accent">{modo.clase}</p>
                </div>
                {modo.disponible ? (
                  <span className="rounded bg-success px-3 py-1 text-xs font-bold uppercase text-black">
                    Activo
                  </span>
                ) : (
                  <span className="rounded bg-muted px-3 py-1 text-xs font-bold uppercase text-zinc-200">
                    Próximamente
                  </span>
                )}
              </div>

              <div className="mt-6">
                {modo.disponible ? (
                  <Link
                    href={`/simulador/${modo.id}`}
                    className="inline-flex min-h-11 items-center justify-center rounded bg-accent px-5 py-2 font-semibold text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                  >
                    Iniciar
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded bg-muted px-5 py-2 font-semibold text-zinc-400"
                  >
                    Iniciar
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>

        <footer className="border-t border-muted pt-5 text-sm text-zinc-400">
          Normativa: DS 021-2008-MTC + Libro Naranja ONU
        </footer>
      </div>
    </main>
  )
}
