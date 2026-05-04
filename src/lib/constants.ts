export const PUNTAJE_APROBATORIO = 70

export const DISTANCIAS_SEGURIDAD_METROS: Record<number, number> = {
  2: 100, // Gases
  3: 50, // Liquidos inflamables
  6: 75, // Toxicos
  8: 50, // Corrosivos
}

export const CONTACTOS_EMERGENCIA = {
  bomberos: '116',
  policia: '105',
  dgaam: '(01) 411-1000',
  indeci: '(01) 225-9898',
} as const

export const CLASES_ONU_NOMBRES: Record<number, string> = {
  2: 'Gases',
  3: 'Líquidos inflamables',
  6: 'Sustancias tóxicas',
  8: 'Sustancias corrosivas',
  9: 'Materiales peligrosos varios',
}
