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
          <div class="section-label">pranzo</div>
          <MealSlot :meal="day.lunch" label="pranzo" />
        </div>

        <!-- Cena -->
        <div class="section">
          <div class="section-label">cena</div>
          <MealSlot :meal="day.dinner" label="cena" />
        </div>

      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import MealSlot from './MealSlot.vue'

const props = defineProps({
  day: { type: Object, required: true },
  todayKey: { type: String, required: true }
})

const DAYS_ORDER = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']

const isPast = computed(() => {
  const todayIdx = DAYS_ORDER.indexOf(props.todayKey)
  const dayIdx = DAYS_ORDER.indexOf(props.day.key)
  return dayIdx < todayIdx
})

// Aperto di default solo se oggi
const isOpen = ref(props.day.isToday)

function toggle() { isOpen.value = !isOpen.value }
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

.section-label {
  @include label-xs;
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
