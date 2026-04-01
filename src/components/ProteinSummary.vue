<template>
  <div class="protein-summary">
    <h3 class="summary-title">proteine questa settimana</h3>
    <div class="protein-grid">
      <div
        v-for="p in proteinSummary"
        :key="p.key"
        class="protein-item"
        :class="{ warn: p.weekly_min && p.logged < p.weekly_min }"
      >
        <div class="protein-name">{{ p.label }}</div>
        <div class="protein-bar-wrap">
          <!-- Piano (sfondo leggero) -->
          <div class="protein-bar protein-bar--planned" :style="{ width: barWidth(p.planned, p) + '%' }"></div>
          <!-- Loggato (sovrapposto) -->
          <div class="protein-bar protein-bar--logged"  :style="{ width: barWidth(p.logged,  p) + '%' }"></div>
        </div>
        <div class="protein-count">
          {{ p.logged }}<span class="protein-planned-count">/{{ p.planned }}</span>
          <span v-if="p.weekly_min || p.weekly_max" class="protein-range">
            · {{ p.weekly_min || 0 }}–{{ p.weekly_max ?? '∞' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  proteinSummary: { type: Array, required: true }
})

function barWidth(count, p) {
  const max = p.weekly_max ?? 5
  return Math.min((count / max) * 100, 100)
}
</script>
