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
        <ProteinSummary v-if="user" :proteinSummary="proteinSummary" />
        <CarbSummary v-if="user" :carbSummary="carbSummary" />
        <ActivityHeatmap v-if="user" />
        <NutritionHistory v-if="user" />
      </aside>
    </div>

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useDiet } from '../composables/useDiet.js'
import { useLog } from '../composables/useLog.js'
import { useAuth } from '../composables/useAuth.js'
import DayCard from '../components/DayCard.vue'
import ProteinSummary from '../components/ProteinSummary.vue'
import CarbSummary from '../components/CarbSummary.vue'
import ActivityHeatmap from '../components/ActivityHeatmap.vue'
import WeekSwaps from '../components/WeekSwaps.vue'
import NutritionHistory from '../components/NutritionHistory.vue'

const { week, todayKey, config } = useDiet()
const { user } = useAuth()
const { fetchLogsForYear, fetchSwapsForWeek, getWeekStart, swapMap, dailyLogs } = useLog()

function resolveMealForSummary(day, mealKey) {
  const swap = swapMap.value[`${day.key}_${mealKey}`]
  let base = day[mealKey]
  if (swap) {
    const target = week.value.find(d => d.key === swap.day)
    base = target?.[swap.meal] ?? day[mealKey]
  }
  const log = dailyLogs.value[day.dateStr]
  const isAlt = log?.[`${mealKey}_alt`] ?? false
  return (isAlt && base?.alt) ? base.alt : base
}

// proteinSummary: planned = piano della settimana (swap + alt), logged = solo pasti con status
const proteinSummary = computed(() => {
  const planned = {}
  const logged  = {}

  week.value.forEach(day => {
    ;['lunch', 'dinner'].forEach(mealKey => {
      const effective = resolveMealForSummary(day, mealKey)
      const log       = dailyLogs.value[day.dateStr]
      const override  = log?.[`${mealKey}_protein`]

      // pianificato: proteina effettiva del pasto (con swap/alt), per tutti i 7 giorni
      const plannedProtein = override || effective?.protein
      if (plannedProtein) planned[plannedProtein] = (planned[plannedProtein] || 0) + 1

      // loggato: solo se il pasto ha uno status registrato
      if (log?.[`${mealKey}_status`] != null) {
        const loggedProtein = override || effective?.protein
        if (loggedProtein) logged[loggedProtein] = (logged[loggedProtein] || 0) + 1
      }
    })
  })

  return Object.entries(config.proteins)
    .filter(([key]) => (planned[key] || 0) > 0 || (logged[key] || 0) > 0)
    .map(([key, meta]) => ({
      key, ...meta,
      planned: planned[key] || 0,
      logged:  logged[key]  || 0,
    }))
})

// carbSummary dai log reali (lunch_carb / dinner_carb salvati per data)
const carbSummary = computed(() => {
  const counts = {}
  week.value.forEach(day => {
    const log = dailyLogs.value[day.dateStr]
    if (log?.lunch_carb)  counts[log.lunch_carb]  = (counts[log.lunch_carb]  || 0) + 1
    if (log?.dinner_carb) counts[log.dinner_carb] = (counts[log.dinner_carb] || 0) + 1
  })
  return Object.entries(config.carbs)
    .filter(([key]) => key !== 'pane')
    .map(([key, meta]) => ({ key, ...meta, count: counts[key] || 0 }))
    .filter(c => c.count > 0)
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
