import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // alamat backend NestJS kamu
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, ''), // hapus prefix /api
      },
    },
  },
});
