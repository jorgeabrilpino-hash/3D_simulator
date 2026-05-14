'use client'

import { Suspense, type ReactNode, useEffect, useState } from 'react'

import { Canvas } from '@react-three/fiber'

import { useSimulatorStore } from '@/store/simulatorStore'

interface SceneWrapperProps {
  children: ReactNode
}

export function SceneWrapper({ children }: SceneWrapperProps) {
  const escenaActual = useSimulatorStore((state) => state.worldState.escena_actual)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)
    const timeout = window.setTimeout(() => setIsTransitioning(false), 220)
    return () => window.clearTimeout(timeout)
  }, [escenaActual])

  return (
    <div className="relative h-full min-h-screen w-full bg-[#0a0a0a]">
      <Canvas
        camera={{ position: [9, 4.5, 9], fov: 55 }}
        dpr={[1, 1.5]}
        shadows
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
          stencil: false,
          depth: true,
        }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
      <div
        className={`pointer-events-none absolute inset-0 bg-black transition-opacity duration-200 ${
          isTransitioning ? 'opacity-55' : 'opacity-0'
        }`}
      />
    </div>
  )
}
