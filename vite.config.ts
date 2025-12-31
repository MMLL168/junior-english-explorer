import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 重要：這裡必須改成你的 GitHub Repository 名稱，前後都要加斜線
  base: '/junior-english-explorer/', 
})