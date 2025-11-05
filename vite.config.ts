import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

const prodBase = '/SavvySheet/';

export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? prodBase : '/',
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
}));
