<template>
  <div class="week-swaps" v-if="weekSwaps.length">
    <h3 class="swaps-title">scambi settimana</h3>
    <div class="swaps-list">
      <div v-for="s in weekSwaps" :key="s.id" class="swap-item">
        <span class="swap-label">
          {{ dayLabel(s.day_a) }} {{ mealLabel(s.meal_a) }}
          <span class="swap-arrow">↔</span>
          {{ dayLabel(s.day_b) }} {{ mealLabel(s.meal_b) }}
        </span>
        <button v-if="user" class="swap-delete" @click="remove(s.id)" title="rimuovi">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLog } from '../composables/useLog.js'
import { useAuth } from '../composables/useAuth.js'

const { weekSwaps, deleteSwap } = useLog()
const { user } = useAuth()

const DAYS_IT = {
  monday: 'lun', tuesday: 'mar', wednesday: 'mer',
  thursday: 'gio', friday: 'ven', saturday: 'sab', sunday: 'dom',
}
const MEAL_IT = { lunch: 'pranzo', dinner: 'cena' }

function dayLabel(key)  { return DAYS_IT[key]  ?? key }
function mealLabel(key) { return MEAL_IT[key] ?? key }

async function remove(id) { await deleteSwap(id) }
</script>
