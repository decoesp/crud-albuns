import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.integration.test.ts'],
    setupFiles: ['src/tests/setup.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    server: {
      deps: {
        inline: ['color-thief-node']
      }
    }
  }
})
