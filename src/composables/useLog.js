import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

// ─── Helpers data ─────────────────────────────────────────────────────────────

function toDateStr(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getWeekStart(date = new Date()) {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - ((day + 6) % 7)) // lunedì
  d.setHours(0, 0, 0, 0)
  return d
}

// ─── State condiviso (singleton per l'app) ───────────────────────────────────

const dailyLogs = ref({})      // { "2026-03-23": { ...row } }
const weekSwaps = ref([])      // swap della settimana corrente
const loading   = ref(false)
const error     = ref(null)

// ─── Composable ──────────────────────────────────────────────────────────────

export function useLog() {

  // ── Daily log ──────────────────────────────────────────────────────────────

  async function fetchLogsForYear() {
    loading.value = true
    error.value   = null
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

    const { data, error: err } = await supabase
      .from('daily_log')
      .select('*')
      .gte('date', toDateStr(oneYearAgo))
      .order('date', { ascending: true })

    if (err) { error.value = err.message }
    else {
      dailyLogs.value = Object.fromEntries(data.map(row => [row.date, row]))
    }
    loading.value = false
  }

  function getLog(dateStr) {
    return dailyLogs.value[dateStr] ?? null
  }

  async function upsertLog(dateStr, patch) {
    const existing = getLog(dateStr)
    const row = { ...existing, ...patch, date: dateStr }

    const { data, error: err } = await supabase
      .from('daily_log')
      .upsert(row, { onConflict: 'date' })
      .select()
      .single()

    if (err) { error.value = err.message; return null }
    dailyLogs.value[dateStr] = data
    return data
  }

  // ── Week swaps ────────────────────────────────────────────────────────────

  async function fetchSwapsForWeek(weekStart) {
    const ws = toDateStr(weekStart ?? getWeekStart())

    const { data, error: err } = await supabase
      .from('week_swaps')
      .select('*')
      .eq('week_start', ws)
      .order('created_at', { ascending: true })

    if (err) { error.value = err.message }
    else { weekSwaps.value = data }
  }

  async function addSwap({ dayA, mealA, dayB, mealB, notes = null }) {
    const ws = toDateStr(getWeekStart())

    // Rimuovi swap esistenti che coinvolgono uno dei due slot
    const slots = new Set([`${dayA}_${mealA}`, `${dayB}_${mealB}`])
    const toDelete = weekSwaps.value.filter(s =>
      slots.has(`${s.day_a}_${s.meal_a}`) || slots.has(`${s.day_b}_${s.meal_b}`)
    )
    for (const s of toDelete) await deleteSwap(s.id)

    const { data, error: err } = await supabase
      .from('week_swaps')
      .insert({
        week_start: ws,
        day_a:  dayA,
        meal_a: mealA,
        day_b:  dayB,
        meal_b: mealB,
        notes,
      })
      .select()
      .single()

    if (err) { error.value = err.message; return null }
    weekSwaps.value.push(data)
    return data
  }

  async function deleteSwap(id) {
    const { error: err } = await supabase
      .from('week_swaps')
      .delete()
      .eq('id', id)

    if (err) { error.value = err.message; return false }
    weekSwaps.value = weekSwaps.value.filter(s => s.id !== id)
    return true
  }

  // ── Computed utili per la UI ──────────────────────────────────────────────

  // Mappa { "monday_lunch": swapPartner, ... } per la settimana corrente
  const swapMap = computed(() => {
    const map = {}
    for (const s of weekSwaps.value) {
      map[`${s.day_a}_${s.meal_a}`] = { day: s.day_b, meal: s.meal_b, id: s.id }
      map[`${s.day_b}_${s.meal_b}`] = { day: s.day_a, meal: s.meal_a, id: s.id }
    }
    return map
  })

  // Livello heatmap per una data:
  // 0 = non loggato, 1 = ok, 2 = sgarro, 3 = ok + attività fisica
  function heatmapLevel(dateStr) {
    const log = getLog(dateStr)
    if (!log) return 0
    const hasSgarro = log.lunch_status === 'sgarro' || log.dinner_status === 'sgarro'
    if (hasSgarro) return 2
    if (log.activity) return 3
    return 1
  }

  return {
    // state
    dailyLogs,
    weekSwaps,
    swapMap,
    loading,
    error,
    // daily log
    fetchLogsForYear,
    getLog,
    upsertLog,
    // week swaps
    fetchSwapsForWeek,
    addSwap,
    deleteSwap,
    // utils
    heatmapLevel,
    getWeekStart,
    toDateStr,
  }
}
