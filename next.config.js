// next.config.js - OBLIGATORIO para R3F + Next.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Three.js necesita transpilacion en Next.js
  transpilePackages: ['three'],

  webpack: (config) => {
    // Permite importar archivos .glb y .gltf
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: { loader: 'file-loader', options: { publicPath: '/_next/static/', outputPath: 'static/' } }
    })
    return config
  },

  // Optimizacion de imagenes para texturas
  images: {
    formats: ['image/webp'],
  },

  // Headers de seguridad para SharedArrayBuffer (necesario para algunos workers de Three.js)
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
