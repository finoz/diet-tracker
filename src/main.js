import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import WeekView from './views/WeekView.vue'
import './styles/main.scss'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: WeekView },
  ]
})

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
