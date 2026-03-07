import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // 請把 '/React-week/week4/' 換成你真實的 GitHub 儲存庫名稱
  base: '/React-week/week4/', 
  plugins: [react()],
})