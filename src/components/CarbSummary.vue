<template>
  <div class="carb-summary">
    <h3 class="summary-title">carboidrati questa settimana</h3>
    <div class="protein-grid">
      <div v-for="c in carbSummary" :key="c.key" class="protein-item">
        <div class="protein-name">{{ c.label }}</div>
        <div class="protein-bar-wrap">
          <div class="carb-bar" :style="{ width: barWidth(c) + '%' }"></div>
        </div>
        <div class="protein-count">{{ c.count }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  carbSummary: { type: Array, required: true }
})

function barWidth(c) {
  return Math.min((c.count / 3) * 100, 100)
}
</script>
