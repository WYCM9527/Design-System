import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import App from './App.vue'
import router from './router'
import './styles/globals.css'

createApp(App).use(router).use(ElementPlus, { locale: zhCn }).mount('#app')
