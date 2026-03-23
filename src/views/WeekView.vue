<template>
  <div class="week-view">

    <div class="week-header">
      <div>
        <h2 class="week-title">settimana corrente</h2>
        <p class="week-date">{{ weekRange }}</p>
      </div>
    </div>

    <div class="layout">
      <div class="days-column">
        <DayCard
          v-for="day in week"
          :key="day.key"
          :day="day"
          :todayKey="todayKey"
          :dateStr="day.dateStr"
        />
      </div>

      <aside class="sidebar">
        <WeekSwaps />
        <ProteinSummary :proteinSummary="proteinSummary" />
        <ActivityHeatmap />
      </aside>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDiet } from '../composables/useDiet.js'
import { useLog } from '../composables/useLog.js'
import DayCard from '../components/DayCard.vue'
import ProteinSummary from '../components/ProteinSummary.vue'
import ActivityHeatmap from '../components/ActivityHeatmap.vue'
import WeekSwaps from '../components/WeekSwaps.vue'

const { week, todayKey, proteinSummary } = useDiet()
const { fetchLogsForYear, fetchSwapsForWeek, getWeekStart } = useLog()

onMounted(async () => {
  await Promise.all([
    fetchLogsForYear(),
    fetchSwapsForWeek(getWeekStart()),
  ])
})

const weekRange = computed(() => {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((day + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = d => d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })
  return `${fmt(monday)} – ${fmt(sunday)} ${sunday.getFullYear()}`
})
</script>

<style lang="scss" scoped>
@use 'helpers' as *;

.week-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.week-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.week-title {
  font-size: 1.8rem;
  color: var(--ink);

  @include respond-to('sm') {
    font-size: 1.4rem;
  }
}

.week-date {
  font-size: 0.82rem;
  color: var(--ink-muted);
  margin-top: 0.2rem;
}

.layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 1.5rem;
  align-items: start;

  @include respond-to('md') {
    grid-template-columns: 1fr;
  }
}

.days-column {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: sticky;
  top: 5rem;

  @include respond-to('md') {
    position: static;
  }
}
</style>
