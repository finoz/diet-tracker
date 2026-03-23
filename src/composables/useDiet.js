import { computed } from 'vue'
import dietData from '../data/diet.json'

const DAYS_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAYS_IT = {
  monday: 'Lunedì', tuesday: 'Martedì', wednesday: 'Mercoledì',
  thursday: 'Giovedì', friday: 'Venerdì', saturday: 'Sabato', sunday: 'Domenica'
}

export function useDiet() {
  const config = dietData

  // Giorno corrente come chiave (monday, tuesday...)
  const todayKey = computed(() => {
    const jsDay = new Date().getDay() // 0=dom, 1=lun...
    const map = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    return map[jsDay]
  })

  // Settimana come array ordinato con label italiana
  const week = computed(() => {
    const now = new Date()
    const jsDay = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((jsDay + 6) % 7))
    monday.setHours(0, 0, 0, 0)

    return DAYS_ORDER.map((key, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      const dateStr = d.toISOString().slice(0, 10)
      return {
        key,
        label: DAYS_IT[key],
        isToday: key === todayKey.value,
        dateStr,
        breakfast: resolveBreakfast(config.week[key].breakfast),
        lunch: resolveMeal(config.week[key].lunch),
        dinner: resolveMeal(config.week[key].dinner),
      }
    })
  })

  function resolveBreakfast(code) {
    return { code, ...config.breakfasts[code] }
  }

  function resolveMeal(slot) {
    if (!slot) return null
    const pattern = config.patterns[slot.pattern]
    const protein = slot.protein ? config.proteins[slot.protein] : null
    const carb = slot.carb ? config.carbs[slot.carb] : null
    const alt = slot.alt ? resolveMeal(slot.alt) : null
    return {
      ...slot,
      patternLabel: pattern?.label,
      patternKey: slot.pattern,
      proteinLabel: protein?.label,
      proteinG: protein?.g ?? slot.protein_g,
      carbLabel: carb?.label,
      carbG: carb?.g,
      alt,
    }
  }

  // Conteggio proteine nella settimana default
  const proteinSummary = computed(() => {
    const counts = {}
    DAYS_ORDER.forEach(day => {
      const d = config.week[day]
      ;[d.lunch, d.dinner].forEach(meal => {
        if (meal?.protein) {
          counts[meal.protein] = (counts[meal.protein] || 0) + 1
        }
      })
    })
    return Object.entries(config.proteins).map(([key, meta]) => ({
      key, ...meta,
      count: counts[key] || 0,
    }))
  })

  return { config, week, todayKey, proteinSummary, DAYS_IT }
}
