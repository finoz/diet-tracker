<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="header-inner">
        <h1 class="app-title">dieta <em>settimanale</em></h1>
        <span class="app-subtitle">Francesco Finotto</span>
        <RouterLink v-if="!user" to="/login" class="header-login">accedi</RouterLink>
        <button v-if="user" class="header-logout" @click="signOut">esci</button>
      </div>
    </header>
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { useAuth } from './composables/useAuth.js'
import { useRouter } from 'vue-router'

const { user, signOut: authSignOut } = useAuth()
const router = useRouter()

async function signOut() {
  await authSignOut()
  router.push('/login')
}
</script>
