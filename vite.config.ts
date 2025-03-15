/// <reference types="vitest" />

import analog from '@analogjs/platform';
import * as path from 'path';
import { defineConfig } from 'vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: __dirname,
  build: {
    reportCompressedSize: true,
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      '@analogjs/trpc',
      '@angular/cdk/clipboard',
      '@angular/cdk/drag-drop',
      '@angular/cdk/layout',
      '@angular/cdk/observers',
      '@angular/common',
      '@angular/forms',

      '@spartan-ng/brain/**',
      'ngx-scrollbar',
      'ngx-sonner',
      'ngx-stripe',
      'embla-carousel-angular',

      '@supabase/ssr',

      'lodash-es',
      'isomorphic-fetch',
    ],
    exclude: ['canvas'],
  },
  ssr: {
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
    chunkSplitPlugin(),
    nodePolyfills({
      include: ['stream', 'http'],
    }),
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
