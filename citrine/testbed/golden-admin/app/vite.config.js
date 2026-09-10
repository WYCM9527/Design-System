import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// base 用相对路径：构建产物可以直接以 file:// 打开截图，不需要服务器
export default defineConfig({
  base: './',
  plugins: [vue()],
  build: { chunkSizeWarningLimit: 2000 }
})
