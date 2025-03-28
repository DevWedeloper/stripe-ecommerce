/// <reference types="vitest" />

import analog from '@analogjs/platform';
import * as path from 'path';
import { defineConfig } from 'vite';
import { chunkSplitPlugin } from 'vite-plugin-chunk-split';
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
      'ngx-image-cropper',

      '@supabase/ssr',

      'lodash-es',
      'pica',
      'isomorphic-fetch',
    ],
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
      liveReload: true,
      nitro: {
        alias: {
          src: path.resolve(__dirname, './src'),
        },
      },
    }),
    tsconfigPaths(),
    chunkSplitPlugin(),
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
