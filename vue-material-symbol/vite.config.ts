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
      entry: 'index.ts',
      name: 'VueMaterialSymbol',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      // Do not bundle Vue or the plugin package
      external: ['vue', /^@hyrioo\/vite-plugin-material-symbols-svg(\/.*)?$/],
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
