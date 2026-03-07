import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// vite.config.js
export default defineConfig({
  // 修正：指向你的 Repository 名稱即可，不要加 /week5/
  base: '/React-week/', 
  plugins: [react()],
})