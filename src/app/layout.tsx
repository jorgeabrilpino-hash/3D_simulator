import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import './globals.css'

export const metadata: Metadata = {
  title: 'ChemSim Perú — Simulador de Capacitación DS 021-2008-MTC',
  description: 'Simulador web de capacitación en respuesta a emergencias con materiales peligrosos.',
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body className="bg-background text-foreground">{children}</body>
    </html>
  )
}
