<template>
  <div class="day-card" :class="{ 'is-today': day.isToday, 'is-open': isOpen, 'is-past': isPast }">

    <button class="day-header" @click="toggle">
      <div class="day-title-row">
        <span class="day-name">{{ day.label }}</span>
        <span v-if="day.isToday" class="today-badge">oggi</span>
      </div>
      <div class="day-summary">
        <span class="summary-pill" :class="`pattern-${day.lunch.patternKey}`">
          {{ day.lunch.proteinLabel || 'Legumi' }}
        </span>
        <span class="summary-pill" :class="`pattern-${day.dinner.patternKey}`">
          {{ day.dinner.patternKey === 'T4' ? 'libero' : (day.dinner.proteinLabel || day.dinner.patternKey) }}
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
            <span v-if="swapMap[`${day.key}_lunch`]" class="swap-badge">
              ↔ {{ dayLabel(swapMap[`${day.key}_lunch`].day) }} cena/pranzo
            </span>
          </div>
          <MealSlot :meal="day.lunch" label="pranzo" />
        </div>

        <!-- Cena -->
        <div class="section">
          <div class="section-label-row">
            <span class="section-label">cena</span>
            <span v-if="swapMap[`${day.key}_dinner`]" class="swap-badge">
              ↔ {{ dayLabel(swapMap[`${day.key}_dinner`].day) }} cena/pranzo
            </span>
          </div>
          <MealSlot :meal="day.dinner" label="cena" />
        </div>

        <!-- Log giornaliero -->
        <div class="section log-section">
          <div class="section-label">log giornaliero</div>
          <div class="log-form">
            <div class="log-row">
              <label class="log-check">
                <input type="checkbox" v-model="logForm.breakfast_ok" @change="saveLog" />
                <span>colazione ok</span>
              </label>
            </div>
            <div class="log-row">
              <span class="log-field-label">pranzo</span>
              <div class="log-status-group">
                <button
                  v-for="s in statuses"
                  :key="s.value"
                  class="log-status-btn"
                  :class="{ active: logForm.lunch_status === s.value }"
                  @click="setStatus('lunch_status', s.value)"
                >{{ s.label }}</button>
              </div>
            </div>
            <div class="log-row">
              <span class="log-field-label">cena</span>
              <div class="log-status-group">
                <button
                  v-for="s in statuses"
                  :key="s.value"
                  class="log-status-btn"
                  :class="{ active: logForm.dinner_status === s.value }"
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
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import MealSlot from './MealSlot.vue'
import { useLog } from '../composables/useLog.js'

const props = defineProps({
  day:      { type: Object, required: true },
  todayKey: { type: String, required: true },
  dateStr:  { type: String, required: true }, // "YYYY-MM-DD"
})

const DAYS_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

const isPast = computed(() => {
  const todayIdx = DAYS_ORDER.indexOf(props.todayKey)
  const dayIdx   = DAYS_ORDER.indexOf(props.day.key)
  return dayIdx < todayIdx
})

const isOpen = ref(props.day.isToday)
function toggle() { isOpen.value = !isOpen.value }

// ── Log ──────────────────────────────────────────────────────────────────────

const DAYS_IT_SHORT = {
  monday: 'lun', tuesday: 'mar', wednesday: 'mer',
  thursday: 'gio', friday: 'ven', saturday: 'sab', sunday: 'dom',
}
function dayLabel(key) { return DAYS_IT_SHORT[key] ?? key }

const { getLog, upsertLog, swapMap } = useLog()

const statuses = [
  { value: 'ok',     label: 'ok' },
  { value: 'sgarro', label: 'sgarro' },
]

const logForm = ref({
  breakfast_ok:   false,
  lunch_status:   null,
  dinner_status:  null,
  notes:          '',
})

const saving = ref(false)

// Popola il form quando i log vengono caricati
watch(() => getLog(props.dateStr), (log) => {
  if (!log) return
  logForm.value = {
    breakfast_ok:  log.breakfast_ok  ?? false,
    lunch_status:  log.lunch_status  ?? null,
    dinner_status: log.dinner_status ?? null,
    notes:         log.notes         ?? '',
  }
}, { immediate: true })

async function saveLog() {
  saving.value = true
  await upsertLog(props.dateStr, {
    breakfast_ok:  logForm.value.breakfast_ok,
    lunch_status:  logForm.value.lunch_status  || null,
    dinner_status: logForm.value.dinner_status || null,
    notes:         logForm.value.notes         || null,
  })
  saving.value = false
}

function setStatus(field, value) {
  // click sullo stesso bottone → deseleziona
  logForm.value[field] = logForm.value[field] === value ? null : value
  saveLog()
}
</script>

<style lang="scss" scoped>
@use 'helpers' as *;

.day-card {
  background: white;
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  transition: box-shadow 0.2s;

  &.is-today {
    box-shadow: 0 0 0 2px var(--accent), var(--shadow);
  }

  &.is-past {
    opacity: 0.55;
  }
}

.day-header {
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto auto;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  text-align: left;
  background: none;

  &:hover {
    background: var(--cream);
  }

  @include respond-to('sm') {
    padding: 0.875rem 1rem;
    gap: 0.5rem;
  }
}

.day-title-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.day-name {
  @include font-serif;
  font-size: 1.1rem;
}

.today-badge {
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--accent);
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
}

.day-summary {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}

.summary-pill {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  border-radius: 20px;
  font-weight: 500;

  @include pattern-colors;
}

.chevron {
  font-size: 1.2rem;
  color: var(--ink-muted);
  transition: transform 0.2s;
  display: inline-block;

  &.open {
    transform: rotate(90deg);
  }
}

.day-body {
  padding: 0 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-top: 1px solid var(--cream-dark);

  @include respond-to('sm') {
    padding: 0 1rem 1rem;
  }
}

.section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.section-label-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-label {
  @include label-xs;
}

.swap-badge {
  font-size: 0.62rem;
  color: var(--t3);
  background: var(--t3-soft);
  padding: 0.1rem 0.4rem;
  border-radius: 20px;
  font-weight: 500;
}

.breakfast-content {
  padding: 0.5rem 0;
}

.breakfast-name {
  font-size: 0.85rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.3rem;
}

.breakfast-items {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;

  li {
    font-size: 0.8rem;
    color: var(--ink-soft);
  }
}

.qty {
  color: var(--ink-muted);
}

.breakfast-notes {
  font-size: 0.72rem;
  color: var(--ink-muted);
  font-style: italic;
  margin-top: 0.4rem;
}

.snacks-row {
  flex-direction: row;
  gap: 0.75rem;

  @include respond-to('sm') {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.snack-pill {
  flex: 1;
  background: var(--cream);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.snack-desc {
  font-size: 0.78rem;
  color: var(--ink-soft);
}

// ── Log form ──────────────────────────────────────────────────────────────────

.log-section {
  border-top: 1px dashed var(--cream-dark);
  padding-top: 0.75rem;
}

.log-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.log-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.log-check {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--ink-soft);
  cursor: pointer;

  input[type="checkbox"] {
    accent-color: var(--t1);
    width: 14px;
    height: 14px;
    cursor: pointer;
  }
}

.log-field-label {
  font-size: 0.72rem;
  color: var(--ink-muted);
  min-width: 38px;
}

.log-status-group {
  display: flex;
  gap: 0.3rem;
}

.log-status-btn {
  font-size: 0.72rem;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  border: 1px solid var(--cream-dark);
  color: var(--ink-muted);
  transition: background 0.15s, color 0.15s, border-color 0.15s;

  &:hover {
    border-color: var(--ink-muted);
    color: var(--ink-soft);
  }

  &.active[class*="ok"] ,
  &.active:first-child {
    background: var(--t1-soft);
    color: var(--t1);
    border-color: var(--t1);
  }

  &.active:last-child {
    background: var(--accent-soft);
    color: var(--accent);
    border-color: var(--accent);
  }
}

.log-notes {
  width: 100%;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.78rem;
  font-weight: 300;
  color: var(--ink);
  background: var(--cream);
  border: 1px solid var(--cream-dark);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.75rem;
  resize: vertical;
  line-height: 1.5;

  &::placeholder {
    color: var(--ink-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--ink-muted);
  }
}

.log-saving {
  font-size: 0.68rem;
  color: var(--ink-muted);
  font-style: italic;
  align-self: flex-end;
}

// ── Transizione apertura ──────────────────────────────────────────────────────

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
