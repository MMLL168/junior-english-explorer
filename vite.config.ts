import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 這是部署到 GitHub Pages 的關鍵設定，確保圖片和腳本路徑正確
})