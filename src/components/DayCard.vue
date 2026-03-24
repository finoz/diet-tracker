<template>
  <div class="day-card" :class="{ 'is-today': day.isToday, 'is-open': isOpen, 'is-past': isPast }">

    <button class="day-header" @click="toggle">
      <div class="day-title-row">
        <span class="day-name">{{ day.label }}</span>
        <span v-if="day.isToday" class="today-badge">oggi</span>
      </div>
      <div class="day-summary">
        <span class="summary-pill" :class="`pattern-${effectiveLunch.patternKey}`">
          {{ effectiveLunch.proteinLabel || 'Legumi' }}
        </span>
        <span class="summary-pill" :class="`pattern-${effectiveDinner.patternKey}`">
          {{ effectiveDinner.patternKey === 'T4' ? 'libero' : (effectiveDinner.proteinLabel || effectiveDinner.patternKey) }}
        </span>
      </div>
      <span class="chevron" :class="{ open: isOpen }">›</span>
    </button>

    <Transition name="slide">
      <div v-if="isOpen" class="day-body">

        <!-- Colazione -->
        <div class="section">
          <div class="section-label">colazione</div>
          <div class="breakfast-content">
            <span class="breakfast-name">{{ day.breakfast.label }}</span>
            <ul class="breakfast-items">
              <li v-for="c in day.breakfast.components" :key="c.item">
                {{ c.item }}<span v-if="c.qty" class="qty"> — {{ c.qty }}</span>
              </li>
            </ul>
            <p v-if="day.breakfast.notes" class="breakfast-notes">{{ day.breakfast.notes }}</p>
          </div>
        </div>

        <!-- Spuntini -->
        <div class="section snacks-row">
          <div class="snack-pill">
            <span class="section-label">spuntino mattina</span>
            <span class="snack-desc">frutto + frutta secca + caffè</span>
          </div>
          <div class="snack-pill">
            <span class="section-label">spuntino pomeriggio</span>
            <span class="snack-desc">frutto + yogurt scremato</span>
          </div>
        </div>

        <!-- Pranzo -->
        <div class="section">
          <div class="section-label-row">
            <span class="section-label">pranzo</span>
            <div class="meal-swap-ctrl">
              <template v-if="swapMap[`${day.key}_lunch`]">
                <span class="swap-badge">↔ {{ dayLabel(swapMap[`${day.key}_lunch`].day) }} {{ mealLabel(swapMap[`${day.key}_lunch`].meal) }}</span>
                <button class="swap-remove" @click.stop="removeSwap(swapMap[`${day.key}_lunch`].id)">×</button>
              </template>
              <button v-else class="swap-cta" @click.stop="openSwapModal('lunch')" title="scambia pasto">↔</button>
            </div>
          </div>
          <div v-if="lunchHasAlt" class="alt-selector">
            <button class="alt-btn" :class="{ active: !logForm.lunch_alt }" @click="setAlt('lunch_alt', false)">piano</button>
            <button class="alt-btn" :class="{ active: logForm.lunch_alt  }" @click="setAlt('lunch_alt', true)">alternativa</button>
          </div>
          <MealSlot :meal="effectiveLunch" label="pranzo" />
        </div>

        <!-- Cena -->
        <div class="section">
          <div class="section-label-row">
            <span class="section-label">cena</span>
            <div class="meal-swap-ctrl">
              <template v-if="swapMap[`${day.key}_dinner`]">
                <span class="swap-badge">↔ {{ dayLabel(swapMap[`${day.key}_dinner`].day) }} {{ mealLabel(swapMap[`${day.key}_dinner`].meal) }}</span>
                <button class="swap-remove" @click.stop="removeSwap(swapMap[`${day.key}_dinner`].id)">×</button>
              </template>
              <button v-else class="swap-cta" @click.stop="openSwapModal('dinner')" title="scambia pasto">↔</button>
            </div>
          </div>
          <div v-if="dinnerHasAlt" class="alt-selector">
            <button class="alt-btn" :class="{ active: !logForm.dinner_alt }" @click="setAlt('dinner_alt', false)">piano</button>
            <button class="alt-btn" :class="{ active: logForm.dinner_alt  }" @click="setAlt('dinner_alt', true)">alternativa</button>
          </div>
          <MealSlot :meal="effectiveDinner" label="cena" />
        </div>

        <!-- Log giornaliero -->
        <div class="section log-section">
          <div class="section-label">log giornaliero</div>
          <div class="log-form">
            <div class="log-checks-row">
              <label class="log-check">
                <input type="checkbox" v-model="logForm.breakfast_ok" @change="saveLog" />
                <span>colazione ok</span>
              </label>
              <label class="log-check">
                <input type="checkbox" v-model="logForm.activity" @change="saveLog" />
                <span>attività fisica</span>
              </label>
            </div>
            <div class="log-row">
              <span class="log-field-label">pranzo</span>
              <div class="log-status-group">
                <button
                  v-for="s in statuses" :key="s.value"
                  class="log-status-btn"
                  :class="[{ active: logForm.lunch_status === s.value }, `status--${s.value}`]"
                  @click="setStatus('lunch_status', s.value)"
                >{{ s.label }}</button>
              </div>
            </div>
            <div class="log-row">
              <span class="log-field-label">cena</span>
              <div class="log-status-group">
                <button
                  v-for="s in statuses" :key="s.value"
                  class="log-status-btn"
                  :class="[{ active: logForm.dinner_status === s.value }, `status--${s.value}`]"
                  @click="setStatus('dinner_status', s.value)"
                >{{ s.label }}</button>
              </div>
            </div>
            <textarea
              v-model="logForm.notes"
              class="log-notes"
              placeholder="note libere: peso, sgarri, ecc."
              rows="2"
              @blur="saveLog"
            />
            <span v-if="saving" class="log-saving">salvataggio…</span>
          </div>
        </div>

      </div>
    </Transition>

    <!-- Modal swap -->
    <SwapPickerModal
      v-if="swapModal"
      :fromDay="day.key"
      :fromMeal="swapModal"
      :week="week"
      @confirm="onSwapConfirm"
      @close="swapModal = null"
    />

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MealSlot from './MealSlot.vue'
import SwapPickerModal from './SwapPickerModal.vue'
import { useLog } from '../composables/useLog.js'
import { useDiet } from '../composables/useDiet.js'

const props = defineProps({
  day:      { type: Object, required: true },
  todayKey: { type: String, required: true },
  dateStr:  { type: String, required: true },
})

const DAYS_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const DAYS_IT_SHORT = {
  monday: 'lun', tuesday: 'mar', wednesday: 'mer',
  thursday: 'gio', friday: 'ven', saturday: 'sab', sunday: 'dom',
}
const MEAL_IT = { lunch: 'pranzo', dinner: 'cena' }

function dayLabel(key)  { return DAYS_IT_SHORT[key] ?? key }
function mealLabel(key) { return MEAL_IT[key] ?? key }

const isPast = computed(() => {
  const todayIdx = DAYS_ORDER.indexOf(props.todayKey)
  const dayIdx   = DAYS_ORDER.indexOf(props.day.key)
  return dayIdx < todayIdx
})

const isOpen = ref(props.day.isToday)
function toggle() { isOpen.value = !isOpen.value }

// ── Swap ──────────────────────────────────────────────────────────────────────

const { week } = useDiet()
const { getLog, upsertLog, swapMap, addSwap, deleteSwap } = useLog()

// Pasto base (già considerando lo swap, ma senza alt)
function resolveSwappedMeal(meal) {
  const swap = swapMap.value[`${props.day.key}_${meal}`]
  if (!swap) return props.day[meal]
  const targetDay = week.value.find(d => d.key === swap.day)
  return targetDay?.[swap.meal] ?? props.day[meal]
}

// Pasto effettivo: swap + scelta alt
const effectiveLunch  = computed(() => {
  const base = resolveSwappedMeal('lunch')
  return (logForm.value.lunch_alt && base.alt) ? base.alt : base
})
const effectiveDinner = computed(() => {
  const base = resolveSwappedMeal('dinner')
  return (logForm.value.dinner_alt && base.alt) ? base.alt : base
})

// Il pasto base ha un'alternativa?
const lunchHasAlt  = computed(() => !!resolveSwappedMeal('lunch').alt)
const dinnerHasAlt = computed(() => !!resolveSwappedMeal('dinner').alt)

const swapModal = ref(null) // null | 'lunch' | 'dinner'

function openSwapModal(meal) { swapModal.value = meal }

async function onSwapConfirm({ dayB, mealB }) {
  await addSwap({
    dayA:  props.day.key,
    mealA: swapModal.value,
    dayB,
    mealB,
  })
  swapModal.value = null
}

async function removeSwap(id) {
  await deleteSwap(id)
}

// ── Log ───────────────────────────────────────────────────────────────────────

const statuses = [
  { value: 'ok',     label: 'ok' },
  { value: 'sgarro', label: 'sgarro' },
]

const logForm = ref({
  breakfast_ok:  false,
  activity:      false,
  lunch_alt:     false,
  dinner_alt:    false,
  lunch_status:  null,
  dinner_status: null,
  notes:         '',
})

const saving = ref(false)

watch(() => getLog(props.dateStr), (log) => {
  if (!log) return
  logForm.value = {
    breakfast_ok:  log.breakfast_ok  ?? false,
    activity:      log.activity      ?? false,
    lunch_alt:     log.lunch_alt     ?? false,
    dinner_alt:    log.dinner_alt    ?? false,
    lunch_status:  log.lunch_status  ?? null,
    dinner_status: log.dinner_status ?? null,
    notes:         log.notes         ?? '',
  }
}, { immediate: true })

async function saveLog() {
  saving.value = true
  await upsertLog(props.dateStr, {
    breakfast_ok:  logForm.value.breakfast_ok,
    activity:      logForm.value.activity,
    lunch_alt:     logForm.value.lunch_alt,
    dinner_alt:    logForm.value.dinner_alt,
    lunch_status:  logForm.value.lunch_status  || null,
    dinner_status: logForm.value.dinner_status || null,
    notes:         logForm.value.notes         || null,
  })
  saving.value = false
}

function setStatus(field, value) {
  logForm.value[field] = logForm.value[field] === value ? null : value
  saveLog()
}

function setAlt(field, value) {
  logForm.value[field] = value
  saveLog()
}
</script>
