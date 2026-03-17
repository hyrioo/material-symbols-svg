import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: 'index.ts',
      },
      name: 'VitePluginMaterialSymbolsSvg',
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      external: [
        'vite',
        'esbuild',
        /^@hyrioo\/vue-material-symbol(\/.*)?$/,
        // Node built-ins that might be referenced by plugin utilities
        'node:fs',
        'node:fs/promises',
        'node:path',
        'node:url',
        'fs',
        'path',
      ],
    },
    sourcemap: true,
    minify: false,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
