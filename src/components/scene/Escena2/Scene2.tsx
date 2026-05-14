'use client'

import { useCallback, useMemo } from 'react'

import { OrbitControls, Sky } from '@react-three/drei'
import * as THREE from 'three'

import { SceneWrapper } from '@/components/scene/SceneWrapper'
import { GasParticles } from '@/components/scene/shared/GasParticles'
import { ObjetoClickable } from '@/components/scene/shared/ObjetoClickable'
import { useSimulatorStore } from '@/store/simulatorStore'

const OBJECT_LABELS: Record<string, string> = {
  panel_kemler: 'Panel Kemler',
  telefono_116: 'Llamar 116',
  triangulos_suelo: 'Triangulos',
  kit_epp_abierto: 'Kit EPP',
  valvula_lateral: 'Valvula',
  balde_agua: 'Agua',
}

function getGasIntensity(fugaPct: number): 'baja' | 'media' | 'alta' {
  if (fugaPct > 50) return 'alta'
  if (fugaPct > 20) return 'media'
  return 'baja'
}

function useDecisionObjects() {
  const worldState = useSimulatorStore((state) => state.worldState)
  const opcionesActuales = useSimulatorStore((state) => state.opcionesActuales)
  const elegirDecision = useSimulatorStore((state) => state.elegirDecision)

  const activeIds = useMemo(() => {
    return new Set(
      opcionesActuales
        ?.map((opcion) => opcion.objeto_3d_id)
        .filter((id): id is string => Boolean(id)) ?? [],
    )
  }, [opcionesActuales])

  const isBlockedByWorldState = useCallback(
    (objectId: string) => {
      if (worldState.trigger_fallo) return true
      if (objectId === 'panel_kemler') return worldState.leyo_kemler
      if (objectId === 'telefono_116') return worldState.llamo_116
      if (objectId === 'triangulos_suelo') return worldState.senalizacion_puesta
      if (objectId === 'kit_epp_abierto') return worldState.epp_puesto
      return false
    },
    [worldState],
  )

  const isActive = useCallback(
    (objectId: string) => activeIds.has(objectId) && !isBlockedByWorldState(objectId),
    [activeIds, isBlockedByWorldState],
  )

  const handleSelect = useCallback(
    (objectId: string) => {
      const decision = opcionesActuales?.find((opcion) => opcion.objeto_3d_id === objectId)
      if (decision) elegirDecision(decision.id)
    },
    [elegirDecision, opcionesActuales],
  )

  return { worldState, isActive, handleSelect }
}

function Ground() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.95} metalness={0} />
      </mesh>

      {[-12, -4, 4, 12].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, z]}>
          <planeGeometry args={[40, 0.15]} />
          <meshStandardMaterial color="#ffffff" opacity={0.8} transparent />
        </mesh>
      ))}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 8]}>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial color="#6b8e3e" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, -8]}>
        <planeGeometry args={[100, 6]} />
        <meshStandardMaterial color="#6b8e3e" roughness={1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 16]}>
        <planeGeometry args={[100, 20]} />
        <meshStandardMaterial color="#6b8e3e" roughness={1} />
      </mesh>
    </>
  )
}

function Mountains() {
  const peaks = useMemo(
    () => [
      [-35, 0, -28, 15, 9],
      [-18, 0, -34, 22, 12],
      [10, 0, -32, 18, 10],
      [32, 0, -25, 14, 8],
      [-42, 0, 24, 12, 7],
      [36, 0, 30, 16, 9],
    ] as const,
    [],
  )

  return (
    <group>
      {peaks.map(([x, y, z, height, radius], index) => (
        <mesh key={`${x}-${z}`} position={[x, y + height / 2 - 0.5, z]}>
          <coneGeometry args={[radius, height, 6]} />
          <meshStandardMaterial color={index % 2 === 0 ? '#5b5141' : '#6c5f4c'} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  )
}

function TankerTruck() {
  return (
    <group position={[0, 0.08, 0]}>
      <mesh position={[-1.7, 0.65, -0.05]} castShadow>
        <boxGeometry args={[1.35, 1.25, 1.45]} />
        <meshStandardMaterial color="#cc2200" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0.35, 0.95, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.72, 0.72, 3.9, 32]} />
        <meshStandardMaterial color="#d0d0d0" metalness={0.85} roughness={0.15} />
      </mesh>
      <mesh position={[0.35, 1.62, 0.01]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 3.55, 16]} />
        <meshStandardMaterial color="#595959" metalness={0.3} roughness={0.5} />
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
    </group>
  )
}

function SafetyTriangle() {
  return (
    <group>
      <mesh rotation={[0, 0, Math.PI / 4]} castShadow>
        <torusGeometry args={[0.35, 0.035, 8, 3]} />
        <meshStandardMaterial color="#ff4d00" emissive="#3b1200" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, -0.28, 0]} castShadow>
        <boxGeometry args={[0.8, 0.07, 0.08]} />
        <meshStandardMaterial color="#222222" />
      </mesh>
    </group>
  )
}

function EppKit() {
  return (
    <group>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[0.9, 0.18, 0.55]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.55} />
      </mesh>
      <mesh position={[-0.2, 0.28, 0.02]} rotation={[0.2, 0.15, 0.1]} castShadow>
        <boxGeometry args={[0.35, 0.08, 0.25]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.45} />
      </mesh>
      <mesh position={[0.25, 0.3, 0.06]} rotation={[0.1, -0.3, 0.2]} castShadow>
        <sphereGeometry args={[0.16, 16, 12]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} />
      </mesh>
    </group>
  )
}

function Phone() {
  return (
    <group rotation={[0.25, -0.15, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.26, 0.08, 0.45]} />
        <meshStandardMaterial color="#111827" roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.045, 0.03]}>
        <boxGeometry args={[0.2, 0.012, 0.3]} />
        <meshStandardMaterial color="#38bdf8" emissive="#0c4a6e" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

function KemlerPanel() {
  return (
    <group rotation={[0, 0.03, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.6, 0.52, 0.04]} />
        <meshStandardMaterial color="#f97316" emissive="#431407" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0, 0.025]}>
        <ringGeometry args={[0.18, 0.22, 4]} />
        <meshStandardMaterial color="#111111" side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function Valve() {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <torusGeometry args={[0.23, 0.035, 12, 24]} />
        <meshStandardMaterial color="#c2410c" metalness={0.25} roughness={0.45} />
      </mesh>
      <mesh castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.6, 12]} />
        <meshStandardMaterial color="#7c2d12" />
      </mesh>
    </group>
  )
}

function WaterBucket() {
  return (
    <group>
      <mesh castShadow>
        <cylinderGeometry args={[0.24, 0.18, 0.42, 20]} />
        <meshStandardMaterial color="#2563eb" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.23, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.24, 0.018, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.25} />
      </mesh>
    </group>
  )
}

function AcidPool({ fugaPct }: { fugaPct: number }) {
  const scale = 1 + Math.min(1.4, fugaPct / 60)

  return (
    <group>
      <mesh position={[1.7, 0.035, 0.85]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55 * scale, 32]} />
        <meshStandardMaterial
          color="#88aa00"
          transparent
          opacity={0.7}
          roughness={0.02}
          metalness={0.3}
          emissive="#556600"
          emissiveIntensity={0.18}
        />
      </mesh>
      <group scale={1.45}>
        <GasParticles
          position={[1.7, 0.55, 0.85]}
          claseONU={8}
          intensidad={getGasIntensity(fugaPct)}
          direccionViento={[0.7, 0.1, -0.35]}
          activo
        />
      </group>
      {fugaPct > 35 ? (
        <GasParticles
          position={[1.4, 0.45, 0.55]}
          claseONU={8}
          intensidad="media"
          direccionViento={[0.55, 0.1, -0.25]}
          activo
        />
      ) : null}
    </group>
  )
}

export function Escena2Contenido() {
  const { worldState, isActive, handleSelect } = useDecisionObjects()

  return (
    <>
      <color attach="background" args={['#87ceeb']} />
      <fog attach="fog" args={['#87ceeb', 60, 200]} />
      <Sky sunPosition={[100, 40, 10]} turbidity={2} rayleigh={0.5} />
      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight
        position={[10, 15, 8]}
        intensity={2}
        color="#fff5e0"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-8, 8, -5]} intensity={0.8} color="#c8e0ff" />

      <Ground />
      <Mountains />
      <TankerTruck />
      <AcidPool fugaPct={worldState.fuga_pct} />

      <ObjetoClickable
        position={[2.38, 1.08, 0.76]}
        objetoId="panel_kemler"
        label={OBJECT_LABELS.panel_kemler}
        isActive={isActive('panel_kemler')}
        onSelect={handleSelect}
      >
        <KemlerPanel />
      </ObjetoClickable>

      <ObjetoClickable
        position={[-1.72, 1.18, -0.78]}
        objetoId="telefono_116"
        label={OBJECT_LABELS.telefono_116}
        isActive={isActive('telefono_116')}
        onSelect={handleSelect}
      >
        <Phone />
      </ObjetoClickable>

      <ObjetoClickable
        position={[-2.2, 0.28, 8.5]}
        objetoId="triangulos_suelo"
        label={OBJECT_LABELS.triangulos_suelo}
        isActive={isActive('triangulos_suelo')}
        onSelect={handleSelect}
      >
        <SafetyTriangle />
      </ObjetoClickable>
      <group position={[2.25, 0.28, 12]} rotation={[0, 0.3, 0]}>
        <SafetyTriangle />
      </group>

      <ObjetoClickable
        position={[-3.1, 0.08, 1.3]}
        objetoId="kit_epp_abierto"
        label={OBJECT_LABELS.kit_epp_abierto}
        isActive={isActive('kit_epp_abierto')}
        onSelect={handleSelect}
      >
        <EppKit />
      </ObjetoClickable>

      <ObjetoClickable
        position={[1.88, 0.82, 0.77]}
        objetoId="valvula_lateral"
        label={OBJECT_LABELS.valvula_lateral}
        isActive={isActive('valvula_lateral')}
        onSelect={handleSelect}
      >
        <Valve />
      </ObjetoClickable>

      <ObjetoClickable
        position={[-3.2, 0.28, 3.4]}
        objetoId="balde_agua"
        label={OBJECT_LABELS.balde_agua}
        isActive={isActive('balde_agua')}
        onSelect={handleSelect}
      >
        <WaterBucket />
      </ObjetoClickable>

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={18}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.05}
        target={[0.3, 0.8, 0.6]}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

export default function Scene2() {
  return (
    <SceneWrapper>
      <Escena2Contenido />
    </SceneWrapper>
  )
}
