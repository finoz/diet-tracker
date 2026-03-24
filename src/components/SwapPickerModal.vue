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
