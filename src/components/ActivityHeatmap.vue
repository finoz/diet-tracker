<template>
  <div class="heatmap">
    <h3 class="heatmap-title">andamento dieta</h3>
    <div class="heatmap-legend">
      <span class="legend-item">
        <span class="legend-dot level-0"></span> non tracciato
      </span>
      <span class="legend-item">
        <span class="legend-dot level-1"></span> tutto ok
      </span>
      <span class="legend-item">
        <span class="legend-dot level-2"></span> qualche sgarro
      </span>
      <span class="legend-item">
        <span class="legend-dot level-3"></span> ok + attività
      </span>
    </div>
    <div class="heatmap-grid">
      <div
        v-for="cell in cells"
        class="heatmap-cell"
        :class="`level-${cell.level}`"
        :title="cell.label"
        :key="cell.dateStr"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useLog } from '../composables/useLog'

const { heatmapLevel, dailyLogs } = useLog()

// Genera 52 settimane × 7 giorni = 364 celle, come GitHub
const cells = computed(() => {
  // Dipendenza esplicita su dailyLogs: quando fetchLogsForYear completa
  // e aggiorna dailyLogs.value, questo computed si ricalcola.
  void dailyLogs.value

  const today = new Date()
  const result = []
  for (let i = 363; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    result.push({
      dateStr,
      level: heatmapLevel(dateStr),
      label: d.toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })
    })
  }
  return result
})
</script>

<style lang="scss" scoped>
@use 'helpers' as *;

.heatmap {
  @include card;
}

.heatmap-title {
  @include font-serif;
  font-size: 1rem;
  color: var(--ink-soft);
  margin-bottom: 0.75rem;
}

.heatmap-legend {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.7rem;
  color: var(--ink-muted);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  display: inline-block;
}

.heatmap-grid {
  display: grid;
  grid-template-rows: repeat(7, 11px);
  grid-auto-flow: column;
  gap: 2px;
  overflow-x: auto;
  padding-bottom: 0.25rem;
  // Scroll fluido su mobile
  -webkit-overflow-scrolling: touch;
}

.heatmap-cell {
  width: 11px;
  height: 11px;
  border-radius: 2px;
}

// ── Livelli colore ────────────────────────────────────────────────────────────

.level-0 { background: var(--cream-dark); }
.level-1 { background: #86c4a4; }
.level-2 { background: #e8a86a; }
.level-3 { background: #3a8f6e; }

.heatmap-note {
  font-size: 0.68rem;
  color: var(--ink-muted);
  font-style: italic;
  margin-top: 0.75rem;
}
</style>
