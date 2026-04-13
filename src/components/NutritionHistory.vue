<template>
  <div class="nutrition-history">

    <div class="nh-header">
      <h3 class="summary-title">nutrizione nel tempo</h3>
      <div class="nh-period">
        <button
          v-for="p in PERIODS"
          :key="p.value"
          class="nh-period-btn"
          :class="{ active: period === p.value }"
          @click="period = p.value"
        >{{ p.label }}</button>
      </div>
    </div>

    <div v-if="isEmpty" class="nh-empty">
      nessun pasto loggato nel periodo selezionato
    </div>

    <template v-else>
      <!-- Proteine -->
      <div class="nh-section">
        <div class="nh-section-label">proteine</div>
        <div class="nh-bar">
          <div
            v-for="seg in proteinSegments"
            :key="seg.key"
            class="nh-segment"
            :style="{ width: seg.pct + '%', background: seg.color }"
            :title="`${seg.label}: ${seg.count} (${seg.pct}%)`"
          >
            <span v-if="seg.pct >= 10" class="nh-seg-label">{{ seg.pct }}%</span>
          </div>
        </div>
        <div class="nh-legend">
          <span v-for="seg in proteinSegments" :key="seg.key" class="nh-legend-item">
            <span class="nh-legend-dot" :style="{ background: seg.color }"></span>
            {{ seg.label }} <span class="nh-legend-count">{{ seg.count }}</span>
          </span>
        </div>
      </div>

      <!-- Carboidrati -->
      <div class="nh-section">
        <div class="nh-section-label">carboidrati</div>
        <div class="nh-bar">
          <div
            v-for="seg in carbSegments"
            :key="seg.key"
            class="nh-segment"
            :style="{ width: seg.pct + '%', background: seg.color }"
            :title="`${seg.label}: ${seg.count} (${seg.pct}%)`"
          >
            <span v-if="seg.pct >= 10" class="nh-seg-label">{{ seg.pct }}%</span>
          </div>
        </div>
        <div v-if="carbSegments.length > 0" class="nh-legend">
          <span v-for="seg in carbSegments" :key="seg.key" class="nh-legend-item">
            <span class="nh-legend-dot" :style="{ background: seg.color }"></span>
            {{ seg.label }} <span class="nh-legend-count">{{ seg.count }}</span>
          </span>
        </div>
        <div v-else class="nh-empty-inline">nessun carboidrato loggato</div>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useDiet } from '../composables/useDiet.js'
import { useLog } from '../composables/useLog.js'

const { config, week } = useDiet()
const { dailyLogs } = useLog()

// ── Stato ─────────────────────────────────────────────────────────────────────

const period = ref('week')

const PERIODS = [
  { value: 'week', label: 'questa settimana' },
  { value: '1m',   label: 'mese' },
  { value: '3m',   label: '3 mesi' },
  { value: 'all',  label: 'tutto' },
]

// ── Colori ────────────────────────────────────────────────────────────────────

const PROTEIN_COLORS = {
  pollo:    '#ECCBD9',
  manzo:    '#B24C63',
  maiale:   '#E8829A',
  pesce:    '#25CED1',
  uova:     '#F5F3BB',
  legumi:   '#548C2F',
  ricotta:  '#E8D5C4',
  formaggi: '#C9A96E',
  tofu:     '#A8C5A0',
}

const CARB_COLORS = {
  pasta:    '#EBEBEB',
  riso:     '#ECD644',
  orzo:     '#F7B801',
  farro:    '#C68642',
  pane:     '#3590F3',
  couscous: '#E4572E',
  patate:   '#DDDDDD',
  pizza:    '#FF6B6B',
}

// ── Helpers date ──────────────────────────────────────────────────────────────

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const JS_DAY_KEYS = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

function getDayKey(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return JS_DAY_KEYS[new Date(y, m - 1, d).getDay()]
}

// ── Risoluzione proteina per una riga di log ──────────────────────────────────

function getProtein(dayKey, mealKey, log) {
  const override = log[`${mealKey}_protein`]
  if (override) return override

  const slot = config.week[dayKey]?.[mealKey]
  if (!slot) return null

  const isAlt = log[`${mealKey}_alt`]
  if (isAlt && slot.alt?.protein) return slot.alt.protein

  return slot.protein ?? null
}

// ── Aggregazione totali nel periodo ──────────────────────────────────────────

const totals = computed(() => {
  const entries = Object.entries(dailyLogs.value)

  let filterFn
  if (period.value === 'week') {
    const weekDates = new Set(week.value.map(d => d.dateStr))
    filterFn = ([d]) => weekDates.has(d)
  } else if (period.value !== 'all') {
    const days    = period.value === '1m' ? 28 : 91
    const cutoff  = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffStr = toDateStr(cutoff)
    filterFn = ([d]) => d >= cutoffStr
  } else {
    filterFn = () => true
  }

  const filteredEntries = entries.filter(filterFn)

  const proteins = {}
  const carbs    = {}

  for (const [dateStr, log] of filteredEntries) {
    const dayKey = getDayKey(dateStr)

    ;['lunch', 'dinner'].forEach(mealKey => {
      const slot   = config.week[dayKey]?.[mealKey]
      const isFree = slot?.pattern === 'T4'

      if (!isFree) {
        if (log[`${mealKey}_status`] != null) {
          const p = getProtein(dayKey, mealKey, log)
          if (p) proteins[p] = (proteins[p] || 0) + 1
          const carb = log[`${mealKey}_carb`]
          if (carb) carbs[carb] = (carbs[carb] || 0) + 1
        }
      } else {
        for (const p of (log[`${mealKey}_free_proteins`] ?? [])) {
          proteins[p] = (proteins[p] || 0) + 1
        }
        for (const c of (log[`${mealKey}_free_carbs`] ?? [])) {
          carbs[c] = (carbs[c] || 0) + 1
        }
      }
    })
  }

  return { proteins, carbs }
})

const isEmpty = computed(() => {
  const { proteins, carbs } = totals.value
  return Object.keys(proteins).length === 0 && Object.keys(carbs).length === 0
})

// ── Costruzione segmenti (ordine config, solo presenti) ───────────────────────

function buildSegments(data, colorMap, labelMap, order) {
  const total = Object.values(data).reduce((a, b) => a + b, 0)
  if (total === 0) return []

  // Prima passata: calcola pct raw per ogni chiave ordinata
  const items = order
    .filter(key => (data[key] ?? 0) > 0)
    .map(key => ({
      key,
      count: data[key],
      color: colorMap[key] ?? '#DDDDDD',
      label: labelMap[key] ?? key,
      rawPct: (data[key] / total) * 100,
    }))

  // Arrotonda al intero garantendo che la somma sia 100
  let sumFloor = 0
  const floored = items.map(item => {
    const f = Math.floor(item.rawPct)
    sumFloor += f
    return { ...item, pct: f, remainder: item.rawPct - f }
  })
  let leftover = 100 - sumFloor
  floored.sort((a, b) => b.remainder - a.remainder)
  for (let i = 0; i < leftover; i++) floored[i].pct += 1
  // Riordina per ordine config
  floored.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))

  return floored
}

const PROTEIN_ORDER = Object.keys(config.proteins)
const CARB_ORDER    = Object.keys(config.carbs)

const PROTEIN_LABELS = Object.fromEntries(
  Object.entries(config.proteins).map(([k, v]) => [k, v.label])
)
const CARB_LABELS = Object.fromEntries(
  Object.entries(config.carbs).map(([k, v]) => [k, v.label])
)

const proteinSegments = computed(() =>
  buildSegments(totals.value.proteins, PROTEIN_COLORS, PROTEIN_LABELS, PROTEIN_ORDER)
)

const carbSegments = computed(() =>
  buildSegments(totals.value.carbs, CARB_COLORS, CARB_LABELS, CARB_ORDER)
)
</script>
