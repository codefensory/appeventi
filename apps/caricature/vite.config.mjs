import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
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
})
