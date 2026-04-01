<template>
  <div class="week-view">

    <div class="week-header">
      <div>
        <h2 class="week-title">settimana corrente</h2>
        <p class="week-date">{{ weekRange }}</p>
      </div>
    </div>

    <div v-if="loading" class="week-loading">
      <div v-for="n in 7" :key="n" class="week-loading-card"></div>
    </div>

    <div v-else class="layout">
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
const { fetchLogsForYear, fetchSwapsForWeek, getWeekStart, swapMap, dailyLogs, loading } = useLog()

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

// proteinSummary: planned = piano della settimana (swap + alt), logged = pasti con status + free meals
const proteinSummary = computed(() => {
  const planned = {}
  const logged  = {}

  week.value.forEach(day => {
    const log = dailyLogs.value[day.dateStr]
    ;['lunch', 'dinner'].forEach(mealKey => {
      const effective = resolveMealForSummary(day, mealKey)
      const override  = log?.[`${mealKey}_protein`]
      const isFree    = effective?.patternKey === 'T4'

      if (!isFree) {
        // Pasto strutturato: planned sempre, logged solo se ha status
        const protein = override || effective?.protein
        if (protein) planned[protein] = (planned[protein] || 0) + 1
        if (log?.[`${mealKey}_status`] != null && protein) {
          logged[protein] = (logged[protein] || 0) + 1
        }
      } else {
        // Pasto libero: planned non conta, logged solo da free_proteins
        const freeProteins = log?.[`${mealKey}_free_proteins`] ?? []
        for (const p of freeProteins) {
          logged[p] = (logged[p] || 0) + 1
        }
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

// carbSummary: log strutturati + free meals
const carbSummary = computed(() => {
  const counts = {}
  week.value.forEach(day => {
    const log = dailyLogs.value[day.dateStr]
    if (!log) return
    ;['lunch', 'dinner'].forEach(mealKey => {
      // Carb da pasto strutturato
      const carb = log[`${mealKey}_carb`]
      if (carb) counts[carb] = (counts[carb] || 0) + 1
      // Carb da pasto libero (multi)
      for (const c of (log[`${mealKey}_free_carbs`] ?? [])) {
        counts[c] = (counts[c] || 0) + 1
      }
    })
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
