<template>
  <div class="day-card" :class="{ 'is-today': day.isToday, 'is-open': isOpen, 'is-past': isPast }">

    <button class="day-header" @click="toggle">
      <div class="day-title-row">
        <span class="day-name">{{ day.label }}</span>
        <span v-if="day.isToday" class="today-badge">oggi</span>
      </div>
      <div class="day-summary">
        <span class="summary-pill" :class="`pattern-${effectiveLunch.patternKey}`">
          {{ effectiveLunch.patternKey === 'T4' ? 'libero' : (effectiveLunch.proteinLabel || effectiveLunch.patternKey) }}
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
          <div class="breakfast-content">
            <div class="section-label">colazione</div>
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
          <div v-if="user && lunchHasAlt" class="alt-selector">
            <button class="alt-btn" :class="{ active: !logForm.lunch_alt }" @click="setAlt('lunch_alt', false)">piano</button>
            <button class="alt-btn" :class="{ active: logForm.lunch_alt  }" @click="setAlt('lunch_alt', true)">alternativa</button>
          </div>
          <MealSlot
            :meal="effectiveLunch"
            label="pranzo"
            :selectedCarb="lunchCarbObj"
            :canChangeProtein="!!user && !!effectiveLunch.protein"
            :overrideProteinLabel="lunchOverride?.label ?? null"
            :overrideProteinG="lunchOverride?.g ?? null"
            @change-protein="openProteinModal('lunch')"
          >
            <template v-if="user" #actions>
              <button class="swap-cta" @click.stop="openSwapModal('lunch')" title="scambia pasto">↔</button>
            </template>
          </MealSlot>
          <div v-if="user && effectiveLunch.patternKey === 'T1' && !effectiveLunch.pane" class="carb-selector">
            <button
              v-for="[key, carb] in selectableCarbs"
              :key="key"
              class="carb-btn"
              :class="{ active: logForm.lunch_carb === key }"
              @click="setCarb('lunch_carb', key)"
            >{{ carb.label }}</button>
          </div>
          <!-- Pasto libero: log proteine e carbo -->
          <template v-if="user && effectiveLunch.patternKey === 'T4'">
            <div class="free-log-label">cosa hai mangiato?</div>
            <div class="free-selector">
              <div class="free-selector-group">
                <span class="free-selector-hint">proteine</span>
                <div class="free-chips">
                  <button
                    v-for="[key, p] in allProteins" :key="key"
                    class="free-chip"
                    :class="{ active: logForm.lunch_free_proteins.includes(key) }"
                    @click="toggleFreeItem('lunch_free_proteins', key)"
                  >{{ p.label }}</button>
                </div>
              </div>
              <div class="free-selector-group">
                <span class="free-selector-hint">carboidrati</span>
                <div class="free-chips">
                  <button
                    v-for="[key, c] in allCarbs" :key="key"
                    class="free-chip"
                    :class="{ active: logForm.lunch_free_carbs.includes(key) }"
                    @click="toggleFreeItem('lunch_free_carbs', key)"
                  >{{ c.label }}</button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Cena -->
        <div class="section">
          <div v-if="user && dinnerHasAlt" class="alt-selector">
            <button class="alt-btn" :class="{ active: !logForm.dinner_alt }" @click="setAlt('dinner_alt', false)">standard</button>
            <button class="alt-btn" :class="{ active: logForm.dinner_alt  }" @click="setAlt('dinner_alt', true)">alternativa</button>
          </div>
          <MealSlot
            :meal="effectiveDinner"
            label="cena"
            :selectedCarb="dinnerCarbObj"
            :canChangeProtein="!!user && !!effectiveDinner.protein"
            :overrideProteinLabel="dinnerOverride?.label ?? null"
            :overrideProteinG="dinnerOverride?.g ?? null"
            @change-protein="openProteinModal('dinner')"
          >
            <template v-if="user" #actions>
              <button class="swap-cta" @click.stop="openSwapModal('dinner')" title="scambia pasto">↔</button>
            </template>
          </MealSlot>
          <div v-if="user && effectiveDinner.patternKey === 'T1' && !effectiveDinner.pane" class="carb-selector">
            <button
              v-for="[key, carb] in selectableCarbs"
              :key="key"
              class="carb-btn"
              :class="{ active: logForm.dinner_carb === key }"
              @click="setCarb('dinner_carb', key)"
            >{{ carb.label }}</button>
          </div>
          <!-- Pasto libero: log proteine e carbo -->
          <template v-if="user && effectiveDinner.patternKey === 'T4'">
            <div class="free-log-label">cosa hai mangiato?</div>
            <div class="free-selector">
              <div class="free-selector-group">
                <span class="free-selector-hint">proteine</span>
                <div class="free-chips">
                  <button
                    v-for="[key, p] in allProteins" :key="key"
                    class="free-chip"
                    :class="{ active: logForm.dinner_free_proteins.includes(key) }"
                    @click="toggleFreeItem('dinner_free_proteins', key)"
                  >{{ p.label }}</button>
                </div>
              </div>
              <div class="free-selector-group">
                <span class="free-selector-hint">carboidrati</span>
                <div class="free-chips">
                  <button
                    v-for="[key, c] in allCarbs" :key="key"
                    class="free-chip"
                    :class="{ active: logForm.dinner_free_carbs.includes(key) }"
                    @click="toggleFreeItem('dinner_free_carbs', key)"
                  >{{ c.label }}</button>
                </div>
              </div>
            </div>
          </template>
        </div>

        <!-- Log giornaliero -->
        <div v-if="user" class="section log-section">
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

    <!-- Modal proteina -->
    <ProteinPickerModal
      v-if="proteinModal"
      :meal="proteinModal"
      :planned="plannedProteinKey(proteinModal === 'lunch' ? effectiveLunch : effectiveDinner)"
      :current="logForm[`${proteinModal}_protein`] ?? plannedProteinKey(proteinModal === 'lunch' ? effectiveLunch : effectiveDinner)"
      @confirm="onProteinConfirm"
      @close="proteinModal = null"
    />

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MealSlot from './MealSlot.vue'
import SwapPickerModal from './SwapPickerModal.vue'
import ProteinPickerModal from './ProteinPickerModal.vue'
import { useLog } from '../composables/useLog.js'
import { useDiet } from '../composables/useDiet.js'
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  day:      { type: Object, required: true },
  todayKey: { type: String, required: true },
  dateStr:  { type: String, required: true },
})

const DAYS_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
const isPast = computed(() => {
  const todayIdx = DAYS_ORDER.indexOf(props.todayKey)
  const dayIdx   = DAYS_ORDER.indexOf(props.day.key)
  return dayIdx < todayIdx
})

const isOpen = ref(props.day.isToday)
function toggle() { isOpen.value = !isOpen.value }

// ── Swap ──────────────────────────────────────────────────────────────────────

const { week, config } = useDiet()
const { getLog, upsertLog, swapMap, addSwap } = useLog()

// Carbs selezionabili
const selectableCarbs = computed(() =>
  Object.entries(config.carbs)
)

function resolveCarb(key) {
  if (!key) return null
  const c = config.carbs[key]
  return c ? { label: c.label, g: c.g } : null
}

const lunchCarbObj  = computed(() => resolveCarb(logForm.value.lunch_carb))
const dinnerCarbObj = computed(() => resolveCarb(logForm.value.dinner_carb))
const { user } = useAuth()

// Segue la catena di swap (con rilevamento cicli)
function resolveSwappedMeal(meal) {
  const visited = new Set()
  let curDay = props.day.key
  let curMeal = meal
  let prevDay = curDay
  let prevMeal = curMeal

  while (true) {
    const key = `${curDay}_${curMeal}`
    if (visited.has(key)) { curDay = prevDay; curMeal = prevMeal; break }
    const swap = swapMap.value[key]
    if (!swap) break
    visited.add(key)
    prevDay = curDay; prevMeal = curMeal
    curDay = swap.day; curMeal = swap.meal
  }

  const targetDay = week.value.find(d => d.key === curDay)
  return targetDay?.[curMeal] ?? props.day[meal]
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

const swapModal    = ref(null) // null | 'lunch' | 'dinner'
const proteinModal = ref(null) // null | 'lunch' | 'dinner'

function openSwapModal(meal)    { swapModal.value = meal }
function openProteinModal(meal) { proteinModal.value = meal }

// Proteina pianificata (chiave) per un pasto effettivo
function plannedProteinKey(mealObj) {
  return mealObj?.protein ?? null
}

// Proteina override risolta: { label, g } o null
function resolveOverrideProtein(overrideKey) {
  if (!overrideKey) return null
  const p = config.proteins[overrideKey]
  return p ? { label: p.label, g: p.g } : null
}

const lunchOverride  = computed(() => resolveOverrideProtein(logForm.value.lunch_protein))
const dinnerOverride = computed(() => resolveOverrideProtein(logForm.value.dinner_protein))

function onProteinConfirm(key) {
  const meal = proteinModal.value
  const planned = plannedProteinKey(meal === 'lunch' ? effectiveLunch.value : effectiveDinner.value)
  // Se si ri-seleziona la proteina pianificata, rimuovi l'override
  logForm.value[`${meal}_protein`] = key === planned ? null : key
  saveLog()
  proteinModal.value = null
}

async function onSwapConfirm({ dayB, mealB }) {
  await addSwap({
    dayA:  props.day.key,
    mealA: swapModal.value,
    dayB,
    mealB,
  })
  swapModal.value = null
}

// ── Log ───────────────────────────────────────────────────────────────────────

const statuses = [
  { value: 'ok',     label: 'ok' },
  { value: 'sgarro', label: 'sgarro' },
]

const logForm = ref({
  breakfast_ok:         false,
  activity:             false,
  lunch_alt:            false,
  dinner_alt:           false,
  lunch_status:         null,
  dinner_status:        null,
  lunch_carb:           null,
  dinner_carb:          null,
  lunch_protein:        null,
  dinner_protein:       null,
  lunch_free_proteins:  [],
  dinner_free_proteins: [],
  lunch_free_carbs:     [],
  dinner_free_carbs:    [],
  notes:                '',
})

const saving = ref(false)

watch(() => getLog(props.dateStr), (log) => {
  if (!log) return
  logForm.value = {
    breakfast_ok:         log.breakfast_ok         ?? false,
    activity:             log.activity             ?? false,
    lunch_alt:            log.lunch_alt            ?? false,
    dinner_alt:           log.dinner_alt           ?? false,
    lunch_status:         log.lunch_status         ?? null,
    dinner_status:        log.dinner_status        ?? null,
    lunch_carb:           log.lunch_carb           ?? null,
    dinner_carb:          log.dinner_carb          ?? null,
    lunch_protein:        log.lunch_protein        ?? null,
    dinner_protein:       log.dinner_protein       ?? null,
    lunch_free_proteins:  log.lunch_free_proteins  ?? [],
    dinner_free_proteins: log.dinner_free_proteins ?? [],
    lunch_free_carbs:     log.lunch_free_carbs     ?? [],
    dinner_free_carbs:    log.dinner_free_carbs    ?? [],
    notes:                log.notes                ?? '',
  }
}, { immediate: true })

async function saveLog() {
  saving.value = true
  await upsertLog(props.dateStr, {
    breakfast_ok:         logForm.value.breakfast_ok,
    activity:             logForm.value.activity,
    lunch_alt:            logForm.value.lunch_alt,
    dinner_alt:           logForm.value.dinner_alt,
    lunch_status:         logForm.value.lunch_status         || null,
    dinner_status:        logForm.value.dinner_status        || null,
    lunch_carb:           logForm.value.lunch_carb           || null,
    dinner_carb:          logForm.value.dinner_carb          || null,
    lunch_protein:        logForm.value.lunch_protein        || null,
    dinner_protein:       logForm.value.dinner_protein       || null,
    lunch_free_proteins:  logForm.value.lunch_free_proteins.length  ? logForm.value.lunch_free_proteins  : null,
    dinner_free_proteins: logForm.value.dinner_free_proteins.length ? logForm.value.dinner_free_proteins : null,
    lunch_free_carbs:     logForm.value.lunch_free_carbs.length     ? logForm.value.lunch_free_carbs     : null,
    dinner_free_carbs:    logForm.value.dinner_free_carbs.length    ? logForm.value.dinner_free_carbs    : null,
    notes:                logForm.value.notes                || null,
  })
  saving.value = false
}

function toggleFreeItem(field, key) {
  const arr = [...(logForm.value[field] ?? [])]
  const idx = arr.indexOf(key)
  if (idx >= 0) arr.splice(idx, 1)
  else arr.push(key)
  logForm.value[field] = arr
  saveLog()
}

const allProteins = computed(() => Object.entries(config.proteins))
const allCarbs    = computed(() => Object.entries(config.carbs))

function setStatus(field, value) {
  logForm.value[field] = logForm.value[field] === value ? null : value
  saveLog()
}

function setAlt(field, value) {
  logForm.value[field] = value
  saveLog()
}

function setCarb(field, key) {
  logForm.value[field] = logForm.value[field] === key ? null : key
  saveLog()
}
</script>
