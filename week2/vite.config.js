import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 必須與你的 Repo 名稱一致，前後都要有斜線
  base: '/React-Week2/', 
})