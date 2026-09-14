import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { defineConfig } from 'vite'

// base 用相对路径：构建产物可以直接静态托管，验收工具用本地服务器打开
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // @wycm9527/citrine 里是 .tsx 源码，不预打包；仓库内它是 file: 符号链接，preserveSymlinks 让包内 import 的 react / echarts 从本项目的 node_modules 解析（发布后的真实安装不需要）
  optimizeDeps: { exclude: ['@wycm9527/citrine'] },
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') }, preserveSymlinks: true },
  build: { chunkSizeWarningLimit: 2000 }
})
