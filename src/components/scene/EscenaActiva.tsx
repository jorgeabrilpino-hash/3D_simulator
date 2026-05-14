'use client'

import type { EscenaId } from '@/engine/types'

import { Escena1Contenido } from './Escena1/Scene1'
import { Escena2Contenido } from './Escena2/Scene2'
import { Escena3Contenido } from './Escena3/Scene3'
import { Escena4Contenido } from './Escena4/Scene4'
import { Escena5Contenido } from './Escena5/Scene5'
import { Escena6Contenido } from './Escena6/Scene6'

interface EscenaActivaProps {
  escenaId: EscenaId
}

export function EscenaActiva({ escenaId }: EscenaActivaProps) {
  if (escenaId === 'escena_2') return <Escena2Contenido />
  if (escenaId === 'escena_3') return <Escena3Contenido />
  if (escenaId === 'escena_4') return <Escena4Contenido />
  if (escenaId === 'escena_5') return <Escena5Contenido />
  if (escenaId === 'escena_6') return <Escena6Contenido />
  if (escenaId === 'escena_1') return <Escena1Contenido />
  return null
}
