<template>
  <div class="protein-summary">
    <h3 class="summary-title">proteine questa settimana</h3>
    <div class="protein-grid">
      <div
        v-for="p in relevantProteins"
        :key="p.key"
        class="protein-item"
        :class="{ warn: p.weekly_min && p.count < p.weekly_min }"
      >
        <div class="protein-name">{{ p.label }}</div>
        <div class="protein-bar-wrap">
          <div class="protein-bar" :style="{ width: barWidth(p) + '%' }"></div>
        </div>
        <div class="protein-count">
          {{ p.count }}
          <span v-if="p.weekly_min || p.weekly_max" class="protein-range">
            / {{ p.weekly_min || 0 }}–{{ p.weekly_max ?? '∞' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  proteinSummary: { type: Array, required: true }
})

const relevantProteins = computed(() =>
  props.proteinSummary.filter(p => p.weekly_max !== 0)
)

function barWidth(p) {
  const max = p.weekly_max ?? 5
  return Math.min((p.count / max) * 100, 100)
}
</script>
