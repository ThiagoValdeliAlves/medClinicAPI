import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['src/test/**/*.service.spec.ts'],

    coverage: {
      provider: 'v8',

      include: ['src/**/*.service.ts'],

      reporter: ['text', 'html', 'lcov'],

      exclude: ['src/test/**'],

      thresholds: { lines: 80, branches: 80, functions: 80, statements: 80 }
    }
  }
})
