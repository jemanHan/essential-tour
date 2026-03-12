import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true, // 5174가 아니면 실행 실패 (다른 포트로 도망 못 감)
    host: '0.0.0.0', // 외부 접속 허용
    proxy: {
      // Tour API는 백엔드가 '/api/tour/*' 경로를 직접 노출하므로 접두사 유지
      '/api/tour': {
        target: 'http://13.209.108.148:3002',
        changeOrigin: true,
        timeout: 5000, // 5초 타임아웃
      },
      // 그 외 '/api/*'는 백엔드의 '/v1/*' 등으로 전달되어야 하므로 '/api' 접두사를 제거
      '/api': {
        target: 'http://13.209.108.148:3002',
        changeOrigin: true,
        timeout: 5000, // 5초 타임아웃
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // 빌드 최적화
  build: {
    target: 'esnext',
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
  // 개발 서버 최적화
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-i18next',
      'i18next',
    ],
  },
})






