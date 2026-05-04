'use client'

import { Suspense, type ReactNode } from 'react'

import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'

interface SceneWrapperProps {
  children: ReactNode
}

export function SceneWrapper({ children }: SceneWrapperProps) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
          Cargando escena...
        </div>
      }
    >
      <Canvas
        camera={{ position: [0, 3, 8], fov: 60 }}
        shadows
        gl={{ antialias: true, alpha: false }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
        {children}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </Suspense>
  )
}
