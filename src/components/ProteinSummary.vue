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

<style lang="scss" scoped>
@use 'helpers' as *;

.protein-summary {
  @include card;
}

.summary-title {
  @include font-serif;
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--ink-soft);
}

.protein-grid {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.protein-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 0.75rem;

  &.warn {
    .protein-name { color: var(--accent); }
    .protein-bar  { background: var(--accent); }
  }
}

.protein-name {
  font-size: 0.78rem;
  color: var(--ink-soft);
}

.protein-bar-wrap {
  height: 4px;
  background: var(--cream-dark);
  border-radius: 2px;
  overflow: hidden;
}

.protein-bar {
  height: 100%;
  background: var(--t1);
  border-radius: 2px;
  transition: width 0.4s ease;
}

.protein-count {
  font-size: 0.78rem;
  color: var(--ink-soft);
  text-align: right;
}

.protein-range {
  color: var(--ink-muted);
}
</style>
