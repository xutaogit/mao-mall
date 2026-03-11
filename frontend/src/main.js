import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'

// 导入 Vant 样式和组件
import Vant from 'vant'
import 'vant/lib/index.css'
import './styles/global.css'

const app = createApp(App)

// 全局注册 Vant 组件
app.use(Vant)
app.use(createPinia())
app.use(router)
app.mount('#app')
