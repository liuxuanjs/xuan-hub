import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // 开发的时候显示源码
  server: {
    open: true,
    host: true,
  },
  build: {
    sourcemap: true,
  },
})
