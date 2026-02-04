import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  
  worker: {
    format: 'es',
    plugins: () => []
  },
  
  server: {
    port: 5174,
    strictPort: true,
    host: true
  },
  
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'react';
            if (id.includes('three')) return 'three';
            if (id.includes('monaco')) return 'monaco';
            return 'vendor';
          }
        }
      }
    }
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'three']
  }
});
