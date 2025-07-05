import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  const isDev = mode === 'development'
  
  return {
    plugins: [
      react(),
      federation({
        name: 'caricature',
        filename: 'remoteEntry.js',
        exposes: {},
        shared: ['react', 'react-dom']
      })
    ],
    server: {
      port: 8080,
      host: true
    },
    preview: {
      port: 8080,
      host: true
    },
    define: {
      'process.env.CLOUDINARY_UPLOAD_PRESET': JSON.stringify(env.CLOUDINARY_UPLOAD_PRESET ?? ''),
      'process.env.CLOUDINARY_CLOUD_NAME': JSON.stringify(env.CLOUDINARY_CLOUD_NAME ?? ''),
      'process.env.GENERATING_API_KEY': JSON.stringify(env.GENERATING_API_KEY ?? ''),
    },
    build: {
      target: 'esnext',
      cssCodeSplit: false,
      rollupOptions: {
        external: [],
        output: {
          format: 'es',
          entryFileNames: 'assets/[name].js',
          minifyInternalExports: false
        }
      }
    },
    css: {
      postcss: './postcss.config.mjs'
    }
  }
})
