import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] px-6 py-8 text-white">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col">
        <header className="border-b border-zinc-800 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">
            DS 021-2008-MTC + Libro Naranja ONU
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal md:text-5xl">ChemSim Peru</h1>
          <p className="mt-3 max-w-2xl text-base text-zinc-300 md:text-lg">
            Simulador 3D de decisiones en emergencias quimicas con acido sulfurico.
          </p>
        </header>

        <section className="grid flex-1 content-center gap-6 py-10">
          <article className="rounded-lg border border-zinc-800 bg-zinc-950 p-6 shadow-lg shadow-black/20">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-orange-400">
                  Escenario principal
                </p>
                <h2 className="mt-2 text-3xl font-semibold">Acido sulfurico ONU 1830</h2>
                <p className="mt-2 text-lg text-zinc-200">Clase 8 - Ruta Lima-Ica</p>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-400">
                  Detecta la fuga, identifica el material, llama al 116, senaliza, espera a bomberos y evita el fallo catastrofico.
                </p>
              </div>
              <Link
                href="/simulador"
                className="inline-flex min-h-11 items-center justify-center rounded bg-orange-500 px-5 py-2 font-semibold text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                Iniciar simulacion
              </Link>
            </div>
          </article>
        </section>

        <footer className="border-t border-zinc-800 pt-5 text-sm text-zinc-400">
          Puntaje minimo aprobatorio: 70%.
        </footer>
      </div>
    </main>
  )
}
