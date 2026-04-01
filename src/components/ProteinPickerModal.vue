<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">cambia proteina · {{ mealLabel }}</span>
          <button class="modal-close" @click="$emit('close')">×</button>
        </div>
        <div class="modal-body">
          <div class="protein-picker-grid">
            <button
              v-for="[key, protein] in selectableProteins"
              :key="key"
              class="protein-pick-btn"
              :class="{
                'protein-pick-btn--active':   key === current,
                'protein-pick-btn--planned':  key === planned && key !== current,
              }"
              @click="confirm(key)"
            >
              <span class="protein-pick-label">{{ protein.label }}</span>
              <span v-if="protein.g" class="protein-pick-g">{{ protein.g }}g</span>
              <span v-if="key === planned" class="protein-pick-tag">piano</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useDiet } from '../composables/useDiet.js'

const props = defineProps({
  meal:    { type: String, required: true },   // 'lunch' | 'dinner'
  planned: { type: String, required: true },   // chiave proteina pianificata
  current: { type: String, required: true },   // chiave proteina corrente (override o = planned)
})

const emit = defineEmits(['confirm', 'close'])

const MEAL_IT = { lunch: 'pranzo', dinner: 'cena' }
const mealLabel = computed(() => MEAL_IT[props.meal] ?? props.meal)

const { config } = useDiet()

// Mostra tutte le proteine tranne legumi (pattern T2) e tofu
const EXCLUDED = ['legumi', 'tofu']
const selectableProteins = computed(() =>
  Object.entries(config.proteins).filter(([key]) => !EXCLUDED.includes(key))
)

function confirm(key) {
  emit('confirm', key)
}
</script>
