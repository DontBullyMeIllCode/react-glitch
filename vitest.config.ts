import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    /*
     * The stylesheet is the whole effect, so it is under test rather than
     * incidental: without this, CSS imports are stubbed out and even an
     * explicit `?raw` import of glitch.css comes back empty.
     */
    css: true,
    globals: true,
    setupFiles: ['./src/setup-tests.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
