'use client'

import { useRef } from 'react'

import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface IndicadorVientoProps {
  position: [number, number, number]
  direccion: number
  isInteractable?: boolean
  onSelect?: () => void
}

export function IndicadorViento({
  position,
  direccion,
  isInteractable,
  onSelect,
}: IndicadorVientoProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 2) * 0.1 + THREE.MathUtils.degToRad(direccion)
  })

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
      <mesh position={[0.15, 0.9, 0]}>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#ff4444" side={THREE.DoubleSide} />
      </mesh>
      {isInteractable && (
        <Html center position={[0, 1.2, 0]} distanceFactor={6}>
          <button
            type="button"
            onClick={onSelect}
            className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600"
          >
            Dirección del viento
          </button>
        </Html>
      )}
    </group>
  )
}
