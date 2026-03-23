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
        <button class="swap-delete" @click="remove(s.id)" title="rimuovi">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useLog } from '../composables/useLog.js'

const { weekSwaps, deleteSwap } = useLog()

const DAYS_IT = {
  monday: 'lun', tuesday: 'mar', wednesday: 'mer',
  thursday: 'gio', friday: 'ven', saturday: 'sab', sunday: 'dom',
}
const MEAL_IT = { lunch: 'pranzo', dinner: 'cena' }

function dayLabel(key)  { return DAYS_IT[key]  ?? key }
function mealLabel(key) { return MEAL_IT[key] ?? key }

async function remove(id) { await deleteSwap(id) }
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
  flex-shrink: 0;

  &:hover { color: var(--accent); }
}
</style>
