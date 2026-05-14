'use client'

import { GasParticles } from './GasParticles'

interface CamionCisternaProps {
  position?: [number, number, number]
  mostrarFuga?: boolean
  fugaPct?: number
  fugaScale?: number
}

function getGasIntensity(fugaPct: number): 'baja' | 'media' | 'alta' {
  if (fugaPct > 40) return 'alta'
  if (fugaPct > 15) return 'media'
  return 'baja'
}

export function CamionCisterna({
  position = [0, 0.08, 0],
  mostrarFuga = true,
  fugaPct = 5,
  fugaScale = 1,
}: CamionCisternaProps) {
  const acidRadius = Math.max(0.25, fugaPct * 0.03 * fugaScale)

  return (
    <group position={position}>
      <mesh position={[-1.7, 0.65, -0.05]} castShadow>
        <boxGeometry args={[1.35, 1.25, 1.45]} />
        <meshStandardMaterial color="#cc2200" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.35, 0.95, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 3.9, 32]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[-1.25, 1.12, -0.78]} castShadow>
        <boxGeometry args={[0.42, 0.38, 0.04]} />
        <meshStandardMaterial color="#4488bb" transparent opacity={0.55} metalness={0.1} roughness={0.05} />
      </mesh>
      {[-1.95, -0.55, 0.8, 1.95].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.25, -0.78]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.8} />
          </mesh>
          <mesh position={[x, 0.25, 0.78]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 24]} />
            <meshStandardMaterial color="#111111" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {mostrarFuga ? (
        <>
          <mesh position={[1.7, 0.75, 0.83]} castShadow>
            <sphereGeometry args={[0.15, 18, 12]} />
            <meshStandardMaterial color="#ffdd00" emissive="#ff6600" emissiveIntensity={2} />
          </mesh>
          <mesh position={[1.7, 0.03, 0.9]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[acidRadius, 28]} />
            <meshStandardMaterial
              color="#aadd00"
              transparent
              opacity={0.8}
              roughness={0.02}
              emissive="#88aa00"
              emissiveIntensity={0.3}
            />
          </mesh>
          <GasParticles
            position={[1.7, 0.85, 0.9]}
            claseONU={8}
            intensidad={getGasIntensity(fugaPct)}
            direccionViento={[0.7, 0.1, -0.2]}
            activo
          />
        </>
      ) : null}
    </group>
  )
}
