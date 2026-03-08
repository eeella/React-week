import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // 👇 必須是這串！前後的斜線 (/) 一個都不能少！
  base: '/React-week/week6/', 
  plugins: [react()],
})