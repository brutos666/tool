/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // ou 'node' si pas de DOM
    setupFiles: ['src/test.setup.ts'],
    globals: true,
    include: ['src/**/*.spec.ts'],
  },
});
