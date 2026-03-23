<template>
  <div class="week-swaps">
    <h3 class="swaps-title">scambi settimana</h3>

    <!-- Lista swap esistenti -->
    <div v-if="weekSwaps.length" class="swaps-list">
      <div v-for="s in weekSwaps" :key="s.id" class="swap-item">
        <span class="swap-label">
          {{ dayLabel(s.day_a) }} {{ mealLabel(s.meal_a) }}
          <span class="swap-arrow">↔</span>
          {{ dayLabel(s.day_b) }} {{ mealLabel(s.meal_b) }}
        </span>
        <button class="swap-delete" @click="remove(s.id)" title="rimuovi">×</button>
      </div>
    </div>
    <p v-else class="swaps-empty">nessuno scambio questa settimana</p>

    <!-- Form aggiunta -->
    <div class="swap-form" :class="{ open: formOpen }">
      <button class="swap-form-toggle" @click="formOpen = !formOpen">
        {{ formOpen ? '↑ annulla' : '+ aggiungi scambio' }}
      </button>

      <Transition name="slide">
        <div v-if="formOpen" class="swap-form-body">
          <div class="swap-form-row">
            <div class="swap-selects">
              <select v-model="form.dayA" class="swap-select">
                <option value="">giorno</option>
                <option v-for="d in days" :key="d.key" :value="d.key">{{ d.label }}</option>
              </select>
              <select v-model="form.mealA" class="swap-select">
                <option value="">pasto</option>
                <option value="lunch">pranzo</option>
                <option value="dinner">cena</option>
              </select>
            </div>

            <span class="swap-form-arrow">↔</span>

            <div class="swap-selects">
              <select v-model="form.dayB" class="swap-select">
                <option value="">giorno</option>
                <option v-for="d in days" :key="d.key" :value="d.key">{{ d.label }}</option>
              </select>
              <select v-model="form.mealB" class="swap-select">
                <option value="">pasto</option>
                <option value="lunch">pranzo</option>
                <option value="dinner">cena</option>
              </select>
            </div>
          </div>

          <input
            v-model="form.notes"
            class="swap-notes"
            type="text"
            placeholder="nota opzionale"
          />

          <p v-if="formError" class="swap-form-error">{{ formError }}</p>

          <button
            class="swap-submit"
            :disabled="saving"
            @click="submit"
          >
            {{ saving ? 'salvataggio…' : 'salva scambio' }}
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useLog } from '../composables/useLog.js'

const { weekSwaps, addSwap, deleteSwap } = useLog()

const DAYS_IT = {
  monday: 'lun', tuesday: 'mar', wednesday: 'mer',
  thursday: 'gio', friday: 'ven', saturday: 'sab', sunday: 'dom',
}
const MEAL_IT = { lunch: 'pranzo', dinner: 'cena' }

const days = [
  { key: 'monday',    label: 'lunedì' },
  { key: 'tuesday',   label: 'martedì' },
  { key: 'wednesday', label: 'mercoledì' },
  { key: 'thursday',  label: 'giovedì' },
  { key: 'friday',    label: 'venerdì' },
  { key: 'saturday',  label: 'sabato' },
  { key: 'sunday',    label: 'domenica' },
]

function dayLabel(key)  { return DAYS_IT[key]  ?? key }
function mealLabel(key) { return MEAL_IT[key] ?? key }

// ── Form ──────────────────────────────────────────────────────────────────────

const formOpen  = ref(false)
const saving    = ref(false)
const formError = ref('')

const form = ref({ dayA: '', mealA: '', dayB: '', mealB: '', notes: '' })

function resetForm() {
  form.value = { dayA: '', mealA: '', dayB: '', mealB: '', notes: '' }
  formError.value = ''
}

async function submit() {
  formError.value = ''
  const { dayA, mealA, dayB, mealB } = form.value

  if (!dayA || !mealA || !dayB || !mealB) {
    formError.value = 'seleziona tutti i campi'
    return
  }
  if (dayA === dayB && mealA === mealB) {
    formError.value = 'i due pasti devono essere diversi'
    return
  }

  saving.value = true
  const result = await addSwap({
    dayA, mealA, dayB, mealB,
    notes: form.value.notes || null,
  })
  saving.value = false

  if (result) {
    resetForm()
    formOpen.value = false
  }
}

async function remove(id) {
  await deleteSwap(id)
}
</script>

<style lang="scss" scoped>
@use 'helpers' as *;

.week-swaps {
  @include card;
}

.swaps-title {
  @include font-serif;
  font-size: 1rem;
  color: var(--ink-soft);
  margin-bottom: 0.75rem;
}

.swaps-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
}

.swap-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  background: var(--cream);
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.6rem;
}

.swap-label {
  font-size: 0.78rem;
  color: var(--ink-soft);
}

.swap-arrow {
  color: var(--ink-muted);
  margin: 0 0.2rem;
}

.swap-delete {
  font-size: 1rem;
  color: var(--ink-muted);
  line-height: 1;
  padding: 0 0.1rem;
  flex-shrink: 0;

  &:hover { color: var(--accent); }
}

.swaps-empty {
  font-size: 0.75rem;
  color: var(--ink-muted);
  font-style: italic;
  margin-bottom: 0.75rem;
}

// ── Form ──────────────────────────────────────────────────────────────────────

.swap-form-toggle {
  font-size: 0.75rem;
  color: var(--ink-muted);
  padding: 0;

  &:hover { color: var(--ink); }
}

.swap-form-body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.6rem;
}

.swap-form-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.swap-selects {
  display: flex;
  gap: 0.3rem;
  flex: 1;
  min-width: 0;
}

.swap-select {
  flex: 1;
  min-width: 0;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--ink);
  background: var(--cream);
  border: 1px solid var(--cream-dark);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.4rem;
  appearance: none;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--ink-muted);
  }
}

.swap-form-arrow {
  font-size: 0.9rem;
  color: var(--ink-muted);
  flex-shrink: 0;
}

.swap-notes {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem;
  font-weight: 300;
  color: var(--ink);
  background: var(--cream);
  border: 1px solid var(--cream-dark);
  border-radius: var(--radius-sm);
  padding: 0.3rem 0.6rem;
  width: 100%;

  &::placeholder { color: var(--ink-muted); }
  &:focus { outline: none; border-color: var(--ink-muted); }
}

.swap-form-error {
  font-size: 0.72rem;
  color: var(--accent);
}

.swap-submit {
  @include label-xs;
  background: var(--ink);
  color: var(--cream);
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-sm);
  align-self: flex-start;
  letter-spacing: 0.05em;
  transition: opacity 0.15s;

  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:not(:disabled):hover { opacity: 0.8; }
}

// ── Transizione ───────────────────────────────────────────────────────────────

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
