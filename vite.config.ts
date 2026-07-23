import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import dts from 'vite-plugin-dts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [ reactCompilerPreset() ] }),
    dts({
      insertTypesEntry: true,
      tsconfigPath: './tsconfig.app.json',
      include: [ 'src/lib/*', 'src/index.ts' ],
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'paysafe-form',
      fileName: format => `paysafe-form.${format}.js`,
      formats: [ 'es', 'cjs' ],
    },
    rollupOptions: {
      external: [ 'react', 'react/jsx-runtime', 'react-dom' ],
      output: {
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
});
