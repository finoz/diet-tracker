<template>
  <div class="login-wrap">
    <form class="login-card" @submit.prevent="submit">
      <h2 class="login-title">accedi</h2>
      <div class="login-field">
        <label class="login-label">email</label>
        <input
          v-model="email"
          type="email"
          class="login-input"
          autocomplete="email"
          required
        />
      </div>
      <div class="login-field">
        <label class="login-label">password</label>
        <input
          v-model="password"
          type="password"
          class="login-input"
          autocomplete="current-password"
          required
        />
      </div>
      <p v-if="errorMsg" class="login-error">{{ errorMsg }}</p>
      <button type="submit" class="login-btn" :disabled="loading">
        {{ loading ? 'accesso…' : 'entra' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const { signIn } = useAuth()
const router = useRouter()

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const errorMsg = ref('')

async function submit() {
  loading.value  = true
  errorMsg.value = ''
  try {
    await signIn(email.value, password.value)
    router.push('/')
  } catch (e) {
    errorMsg.value = 'credenziali errate'
  } finally {
    loading.value = false
  }
}
</script>
