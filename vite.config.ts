import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'MiniApp',
      formats: ['es', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'u-miniapp-bridge.es.js';
        if (format === 'umd') return 'u-miniapp-bridge.umd.js';
        return `u-miniapp-bridge.${format}.js`;
      },
    },
    rollupOptions: {
      output: {
        exports: 'named',
        // UMD 全局变量名
        globals: {},
      },
    },
    sourcemap: true,
  },
});
