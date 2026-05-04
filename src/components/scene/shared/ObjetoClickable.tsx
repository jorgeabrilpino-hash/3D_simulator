'use client'

import { useState, type ReactNode } from 'react'

import type { ThreeEvent } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'

interface ObjetoClickableProps {
  position: [number, number, number]
  objetoId: string
  label: string
  isActive: boolean
  onSelect: (id: string) => void
  children: ReactNode
}

export function ObjetoClickable({
  position,
  objetoId,
  label,
  isActive,
  onSelect,
  children,
}: ObjetoClickableProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered)

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation()
    if (isActive) onSelect(objetoId)
  }

  return (
    <group
      position={position}
      onClick={handleClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      {children}
      {hovered && isActive && (
        <Html center distanceFactor={8}>
          <div className="pointer-events-none whitespace-nowrap rounded bg-yellow-400 px-2 py-1 text-xs font-bold text-black">
            {label}
          </div>
        </Html>
      )}
      {isActive && (
        <mesh>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshBasicMaterial color={hovered ? '#ff6600' : '#ffcc00'} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
