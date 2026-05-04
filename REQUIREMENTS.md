# Requirements

## Runtime

- Node.js 20 LTS recomendado.
- npm 10 o superior.

El proyecto fue desarrollado con Next.js 14.2.5 y React 18.

## Instalacion de dependencias

Usa el lockfile del repositorio:

```bash
npm ci
```

Alternativa si necesitas regenerar dependencias:

```bash
npm install
```

## Scripts disponibles

```bash
npm run dev
```

Inicia el servidor de desarrollo en `http://localhost:3000`.

```bash
npm run build
```

Compila el proyecto para produccion.

```bash
npm run start
```

Ejecuta el build de produccion.

```bash
npm run lint
```

Ejecuta lint de Next.js.

## Dependencias principales

- `next@14.2.5`
- `react@18`
- `react-dom@18`
- `three@0.167.0`
- `@react-three/fiber@8.17.5`
- `@react-three/drei@9.108.3`
- `@react-three/postprocessing@2.16.2`
- `zustand@4.5.4`
- `framer-motion@11.3.17`
- `tailwindcss@3.4.x`
- `typescript@5.x`

## Variables de entorno

No son necesarias para ejecutar el MVP actual.

No commitear `.env`, `.env.local` ni variantes con secretos.
