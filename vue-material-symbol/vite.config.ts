import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    vue(),
    viteStaticCopy({
      targets: [
        {
          src: '../readme.md',
          dest: '..',
          rename: 'README.md',
        },
      ],
    }),
  ],
  build: {
    lib: {
      entry: {
        index: 'index.ts',
        consumer: 'consumer.ts',
        tooling: 'tooling.ts',
        'loader-map': 'src/consumer/loader-map.js',
      },
      name: 'VueMaterialSymbol',
      formats: ['es'],
      fileName: (format, entryName) => {
        if (entryName === 'loader-map') {
          return format === 'es' ? 'loader-map.js' : 'loader-map.cjs';
        }

        return `${entryName}.${format === 'es' ? 'js' : 'cjs'}`;
      },
    },
    rollupOptions: {
      external: [
        'vue',
        'node:fs',
        'node:fs/promises',
        'node:path',
        'fs',
        'path',
      ],
      output: {
        globals: {
          vue: 'Vue',
        },
      },
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
});
