import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// base 用相对路径：构建产物可以直接以 file:// 打开截图，不需要服务器
export default defineConfig({
  base: './',
  plugins: [vue()],
  // @wycm9527/citrine 里是 .vue / .js 源码，交给 Vue 插件编译而不是 esbuild 预打包；
  // 仓库内它是 file: 符号链接，preserveSymlinks 让包内 import 的 element-plus / echarts / @icon-park 从本项目的 node_modules 解析（发布后的真实安装不需要这一项）
  optimizeDeps: { exclude: ['@wycm9527/citrine'] },
  resolve: { preserveSymlinks: true },
  build: { chunkSizeWarningLimit: 2000 }
})
