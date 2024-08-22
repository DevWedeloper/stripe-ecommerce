/// <reference types="vitest" />

import analog from '@analogjs/platform';
import * as path from 'path';
import { defineConfig, splitVendorChunkPlugin } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: __dirname,
  build: {
    reportCompressedSize: true,
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module', 'browser'],
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  ssr: {
    optimizeDeps: {
      include: ['isomorphic-fetch'],
    },
    noExternal: [
      '@analogjs/trpc',
      '@trpc/server',
      '@spartan-ng/**',
      '@ng-icons/**',
      'ngx-scrollbar',
      'ngx-sonner',
    ],
  },
  plugins: [
    analog({
      nitro: {
        alias: {
          src: path.resolve(__dirname, './src'),
        },
      },
    }),
    tsconfigPaths(),
    splitVendorChunkPlugin(),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
    include: ['**/*.spec.ts'],
    reporters: ['default'],
  },
  define: {
    'import.meta.vitest': mode !== 'production',
  },
}));
