import { ref } from 'vue'
import { supabase } from '../lib/supabase.js'

// Singleton: user condiviso tra tutti i componenti
const user = ref(null)
const authReady = ref(false)

// Inizializza la sessione esistente (chiamato una volta in main.js)
export async function initAuth() {
  const { data } = await supabase.auth.getSession()
  user.value = data.session?.user ?? null
  authReady.value = true

  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
  })
}

export function useAuth() {
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    user.value = data.user
  }

  async function signOut() {
    await supabase.auth.signOut()
    user.value = null
  }

  return { user, authReady, signIn, signOut }
}
