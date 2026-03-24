import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import WeekView from './views/WeekView.vue'
import LoginView from './views/LoginView.vue'
import { initAuth, useAuth } from './composables/useAuth.js'
import './styles/main.scss'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',      component: WeekView },
    { path: '/login', component: LoginView },
  ]
})

// Aspetta che la sessione Supabase sia pronta prima di navigare
let authInitialized = false

router.beforeEach(async (to) => {
  if (!authInitialized) {
    await initAuth()
    authInitialized = true
  }

  const { user } = useAuth()
  if (to.path === '/login' && user.value) return '/'
})

const pinia = createPinia()
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')
