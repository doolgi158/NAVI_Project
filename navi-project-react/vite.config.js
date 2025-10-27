import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "react-quill": path.resolve(__dirname, "node_modules/react-quill/lib/index.js"),
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
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      '/adm': {
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/images': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    },
  },
  optimizeDeps: {
    include: ["react-quill"],
  },
});