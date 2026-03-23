<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">scambia {{ mealLabel(fromMeal) }} di {{ dayLabel(fromDay) }} con…</span>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>

        <div class="modal-body">
          <div class="picker-grid">
            <button
              v-for="opt in options"
              :key="`${opt.day}_${opt.meal}`"
              class="pick-btn"
              :class="{ 'pick-btn--free': opt.isFree }"
              @click="confirm(opt)"
            >
              <span class="pick-day">{{ dayLabel(opt.day) }}</span>
              <span class="pick-meal">{{ mealLabel(opt.meal) }}</span>
              <span v-if="opt.isFree" class="pick-tag">libero</span>
              <span v-else class="pick-tag">{{ opt.proteinLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  fromDay:  { type: String, required: true },
  fromMeal: { type: String, required: true },
  week:     { type: Array,  required: true }, // array dei giorni risolti da useDiet
})

const emit = defineEmits(['confirm', 'close'])

const DAYS_IT = {
  monday: 'lunedì', tuesday: 'martedì', wednesday: 'mercoledì',
  thursday: 'giovedì', friday: 'venerdì', saturday: 'sabato', sunday: 'domenica',
}
const MEAL_IT = { lunch: 'pranzo', dinner: 'cena' }

function dayLabel(key)  { return DAYS_IT[key]  ?? key }
function mealLabel(key) { return MEAL_IT[key] ?? key }

// Tutte le opzioni tranne il pasto corrente
const options = props.week.flatMap(day =>
  ['lunch', 'dinner'].map(meal => {
    if (day.key === props.fromDay && meal === props.fromMeal) return null
    const slot = day[meal]
    return {
      day:          day.key,
      meal,
      isFree:       slot?.patternKey === 'T4',
      proteinLabel: slot?.proteinLabel || slot?.patternKey || '—',
    }
  }).filter(Boolean)
)

function confirm(opt) {
  emit('confirm', { dayB: opt.day, mealB: opt.meal })
}
</script>

<style lang="scss" scoped>
@use 'helpers' as *;

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(26, 23, 20, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: var(--radius);
  box-shadow: 0 8px 32px rgba(26, 23, 20, 0.2);
  width: 100%;
  max-width: 380px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem 0.75rem;
  border-bottom: 1px solid var(--cream-dark);
}

.modal-title {
  @include font-serif;
  font-size: 0.95rem;
  color: var(--ink-soft);
}

.modal-close {
  font-size: 1.25rem;
  color: var(--ink-muted);
  line-height: 1;
  padding: 0 0.1rem;

  &:hover { color: var(--ink); }
}

.modal-body {
  padding: 0.75rem 1rem 1rem;
}

.picker-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.4rem;
}

.pick-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.1rem;
  background: var(--cream);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  text-align: left;
  transition: background 0.15s;

  &:hover {
    background: var(--cream-dark);
  }

  &--free {
    background: var(--t4-soft);
    &:hover { background: #e6c4e0; }
  }
}

.pick-day {
  font-size: 0.78rem;
  font-weight: 500;
  color: var(--ink);
}

.pick-meal {
  @include label-xs;
  color: var(--ink-muted);
  text-transform: lowercase;
  letter-spacing: 0;
}

.pick-tag {
  font-size: 0.68rem;
  color: var(--ink-muted);
  font-style: italic;
  margin-top: 0.1rem;
}
</style>
