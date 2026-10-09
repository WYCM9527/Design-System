import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import './styles/globals.css'

// 另一模式按 design-system/theme-map.json：<html class="dark">；截图脚本用 ?theme=dark 直达
if (new URLSearchParams(location.search).get('theme') === 'dark') document.documentElement.classList.add('dark')

createApp(App).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')
