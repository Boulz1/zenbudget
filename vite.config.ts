/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts', // Optionnel: pour la configuration globale des tests
    css: false, // Si vous ne testez pas les CSS, pour accélérer
    coverage: {
      provider: 'v8', // ou 'istanbul'
      reporter: ['text', 'json', 'html'], // Formats de rapport
      // Spécifier les fichiers à inclure et à exclure pour un rapport plus précis
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/**/*.test.{ts,tsx}',
        'src/test/setup.ts',
        'src/types/index.ts' // Les fichiers de types purs n'ont pas de logique à tester directement
      ],
    },
  },
})
