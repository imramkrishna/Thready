import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    cli: 'src/cli.ts',
  },
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  splitting: false,
  platform: 'node',
  dts: {
    entry: {
      index: 'src/index.ts',
    },
  },
  outDir: 'dist',
  banner: {
    js: '#!/usr/bin/env node',
  },
});
