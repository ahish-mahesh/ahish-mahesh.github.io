import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// User site (<user>.github.io), served from the domain root.
export default defineConfig({
  base: '/',
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
});
