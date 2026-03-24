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
