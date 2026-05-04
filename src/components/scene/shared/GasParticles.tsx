'use client'

import { useMemo, useRef } from 'react'

import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GasParticlesProps {
  position: [number, number, number]
  claseONU: 2 | 3 | 6 | 8
  intensidad?: 'baja' | 'media' | 'alta'
  direccionViento?: [number, number, number]
  activo?: boolean
}

const CONFIG_CLASES = {
  2: { color: '#ffffff', opacidadMax: 0.6, velocidad: 0.015, spread: 0.8 },
  3: { color: '#ff6600', opacidadMax: 0.5, velocidad: 0.012, spread: 0.6 },
  6: { color: '#aaff00', opacidadMax: 0.7, velocidad: 0.008, spread: 0.4 },
  8: { color: '#ffff00', opacidadMax: 0.5, velocidad: 0.01, spread: 0.5 },
}

const CONTEOS_INTENSIDAD = { baja: 150, media: 300, alta: 500 }

export function GasParticles({
  position,
  claseONU,
  intensidad = 'media',
  direccionViento = [1, 0, 0],
  activo = true,
}: GasParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null)
  const config = CONFIG_CLASES[claseONU]
  const baseCount = CONTEOS_INTENSIDAD[intensidad]
  const count =
    typeof window !== 'undefined' && window.innerWidth < 768
      ? Math.max(1, Math.floor(baseCount * 0.4))
      : baseCount

  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    const opacities = new Float32Array(count)

    for (let i = 0; i < count; i += 1) {
      positions[i * 3] = (Math.random() - 0.5) * 0.3
      positions[i * 3 + 1] = Math.random() * 0.2
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.3

      velocities[i * 3] = direccionViento[0] * config.velocidad + (Math.random() - 0.5) * 0.005
      velocities[i * 3 + 1] = config.velocidad * (0.5 + Math.random() * 0.5)
      velocities[i * 3 + 2] =
        direccionViento[2] * config.velocidad + (Math.random() - 0.5) * 0.005

      opacities[i] = Math.random()
    }

    return { positions, velocities, opacities }
  }, [config.velocidad, count, direccionViento])

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions.slice(), 3))
    return geo
  }, [positions])

  useFrame(() => {
    if (!pointsRef.current || !activo) return

    const posAttr = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute
    const posArray = posAttr.array as Float32Array

    for (let i = 0; i < count; i += 1) {
      posArray[i * 3] += velocities[i * 3]
      posArray[i * 3 + 1] += velocities[i * 3 + 1]
      posArray[i * 3 + 2] += velocities[i * 3 + 2]

      const altura = posArray[i * 3 + 1]
      if (altura > config.spread * 3) {
        posArray[i * 3] = (Math.random() - 0.5) * 0.3
        posArray[i * 3 + 1] = Math.random() * 0.2
        posArray[i * 3 + 2] = (Math.random() - 0.5) * 0.3
      }
    }

    posAttr.needsUpdate = true
  })

  if (!activo) return null

  return (
    <points ref={pointsRef} position={position} geometry={geometry}>
      <pointsMaterial
        color={config.color}
        size={0.04}
        transparent
        opacity={config.opacidadMax}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  )
}
