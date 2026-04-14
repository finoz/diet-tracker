import { ref, computed } from 'vue'
import dietData from '../data/diet.json'

const DAYS_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAYS_IT = {
  monday: 'Lunedì', tuesday: 'Martedì', wednesday: 'Mercoledì',
  thursday: 'Giovedì', friday: 'Venerdì', saturday: 'Sabato', sunday: 'Domenica'
}

// Offset settimane rispetto alla corrente (0 = oggi, -1 = scorsa, ecc.)
// Stato a livello modulo: condiviso tra tutti i componenti
const weekOffset = ref(0)

export function useDiet() {
  const config = dietData

  // Giorno corrente come chiave, indipendente dalla navigazione
  const todayKey = computed(() => {
    const map = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    return map[new Date().getDay()]
  })

  function localDateStr(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  const todayStr = computed(() => localDateStr(new Date()))

  // Settimana visualizzata (dipende da weekOffset)
  const week = computed(() => {
    const now = new Date()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((now.getDay() + 6) % 7) + weekOffset.value * 7)
    monday.setHours(0, 0, 0, 0)

    return DAYS_ORDER.map((key, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = localDateStr(d)
      return {
        key,
        label: DAYS_IT[key],
        isToday: dateStr === todayStr.value,
        dateStr,
        breakfast: resolveBreakfast(config.week[key].breakfast),
        lunch:     resolveMeal(config.week[key].lunch),
        dinner:    resolveMeal(config.week[key].dinner),
      }
    })
  })

  const isCurrentWeek = computed(() => weekOffset.value === 0)

  function goPrevWeek() { weekOffset.value-- }
  function goNextWeek() { if (!isCurrentWeek.value) weekOffset.value++ }

  function resolveBreakfast(code) {
    return { code, ...config.breakfasts[code] }
  }

  function resolveMeal(slot) {
    if (!slot) return null
    const pattern = config.patterns[slot.pattern]
    const protein = slot.protein ? config.proteins[slot.protein] : null
    const carb    = slot.carb    ? config.carbs[slot.carb]       : null
    const alt     = slot.alt     ? resolveMeal(slot.alt)          : null
    return {
      ...slot,
      patternLabel: pattern?.label,
      patternKey:   slot.pattern,
      proteinLabel: protein?.label,
      proteinG:     slot.protein_g ?? (protein?.g != null ? config.meta.default_protein_g : null),
      carbLabel:    carb?.label,
      carbG:        carb?.g,
      alt,
    }
  }

  // Conteggio proteine nella settimana default (usato da WeekView per il piano)
  const proteinSummary = computed(() => {
    const counts = {}
    DAYS_ORDER.forEach(day => {
      const d = config.week[day]
      ;[d.lunch, d.dinner].forEach(meal => {
        if (meal?.protein) counts[meal.protein] = (counts[meal.protein] || 0) + 1
      })
    })
    return Object.entries(config.proteins).map(([key, meta]) => ({
      key, ...meta,
      count: counts[key] || 0,
    }))
  })

  return { config, week, todayKey, todayStr, proteinSummary, DAYS_IT, weekOffset, isCurrentWeek, goPrevWeek, goNextWeek }
}
