import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // React 개발 서버 포트
    proxy: {
      // API 요청 경로를 Spring Boot 서버로 전달합니다.
      '/api': { 
        target: 'http://localhost:8080', // Spring Boot 기본 포트
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') 
      },
    }
  }
});