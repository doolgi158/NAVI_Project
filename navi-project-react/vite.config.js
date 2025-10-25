import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ '@/...' → 'src/...'
    },
  },
  css: {
    // ✅ PostCSS 설정 파일을 명시적으로 연결
    postcss: path.resolve(__dirname, "./postcss.config.js"),
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/adm': {  // 이거 추가!
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/images': {  // 이미지 프록시 추가
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})