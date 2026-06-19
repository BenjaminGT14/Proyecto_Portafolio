import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.js'

// Reutiliza la config de Vite (alias "@", plugin de React) y le añade
// la configuración de pruebas. Vitest da prioridad a este archivo sobre vite.config.js.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      // Simula un navegador (DOM) sobre Node para renderizar componentes React.
      environment: 'jsdom',
      // Permite usar describe/it/expect sin importarlos (igual los importamos para el linter).
      globals: true,
      // Se ejecuta antes de cada archivo de pruebas: matchers de jest-dom + limpieza.
      setupFiles: ['./src/test/setup.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{js,jsx}'],
        exclude: [
          'src/**/*.{test,spec}.{js,jsx}',
          'src/test/**',
          'src/main.jsx',
          'src/App.jsx',
        ],
      },
    },
  }),
)
