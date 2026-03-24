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

const { week, todayKey, config } = useDiet()
const { fetchLogsForYear, fetchSwapsForWeek, getWeekStart, swapMap, dailyLogs } = useLog()

// proteinSummary che tiene conto di swap e scelte alt
const proteinSummary = computed(() => {
  const counts = {}
  week.value.forEach(day => {
    ;['lunch', 'dinner'].forEach(mealKey => {
      // applica swap
      const swap = swapMap.value[`${day.key}_${mealKey}`]
      let base = day[mealKey]
      if (swap) {
        const target = week.value.find(d => d.key === swap.day)
        base = target?.[swap.meal] ?? day[mealKey]
      }
      // applica scelta alt
      const log = dailyLogs.value[day.dateStr]
      const isAlt = log?.[`${mealKey}_alt`] ?? false
      const effective = (isAlt && base?.alt) ? base.alt : base

      if (effective?.protein) {
        counts[effective.protein] = (counts[effective.protein] || 0) + 1
      }
    })
  })
  return Object.entries(config.proteins).map(([key, meta]) => ({
    key, ...meta,
    count: counts[key] || 0,
  }))
})

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
