<template>
  <div class="meal-slot" :class="`pattern-${meal.patternKey}`">
    <div class="meal-header">
      <span class="meal-label">{{ label }}</span>
      <span class="pattern-badge">{{ meal.patternKey }}</span>
    </div>

    <div v-if="meal.patternKey === 'T4'" class="meal-free">
      libero
    </div>

    <div v-else class="meal-body">
      <div v-if="meal.carbLabel" class="meal-item carb">
        <span class="item-dot">●</span>
        <span>{{ meal.carbLabel }}<em v-if="meal.carbG"> {{ meal.carbG }}g</em></span>
      </div>
      <div v-if="meal.proteinLabel" class="meal-item protein">
        <span class="item-dot">●</span>
        <span>{{ meal.proteinLabel }}<em v-if="meal.proteinG"> {{ meal.proteinG }}g</em></span>
      </div>
      <div class="meal-item verdure">
        <span class="item-dot">●</span>
        <span>Verdure<em v-if="meal.verdure_g"> {{ meal.verdure_g }}g</em></span>
      </div>
      <div v-if="meal.pane" class="meal-item pane">
        <span class="item-dot">●</span>
        <span>Pane</span>
      </div>
      <div v-if="meal.notes" class="meal-notes">{{ meal.notes }}</div>
    </div>

    <!-- Alternativa -->
    <div v-if="meal.alt" class="meal-alt">
      <button class="alt-toggle" @click="showAlt = !showAlt">
        {{ showAlt ? '↑ nascondi' : '↓ alternativa' }}
      </button>
      <div v-if="showAlt" class="alt-body">
        <MealSlot :meal="meal.alt" label="alt." />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  meal: { type: Object, required: true },
  label: { type: String, default: '' }
})

const showAlt = ref(false)
</script>

<style lang="scss" scoped>
@use 'helpers' as *;

.meal-slot {
  border-radius: var(--radius-sm);
  padding: 0.75rem;
  background: var(--cream);
  border-left: 3px solid var(--ink-muted);

  @include pattern-border-colors;
}

.meal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;
}

.meal-label {
  font-size: 0.65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--ink-soft);
}

.pattern-badge {
  font-size: 0.6rem;
  font-weight: 500;
  letter-spacing: 0.05em;
  opacity: 0.5;
}

.meal-free {
  @include font-serif;
  font-style: italic;
  color: var(--ink-soft);
  font-size: 0.95rem;
}

.meal-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.meal-item {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: var(--ink);

  em {
    color: var(--ink-muted);
    font-style: normal;
    font-size: 0.75rem;
  }
}

.item-dot {
  font-size: 0.4rem;
  opacity: 0.4;
  flex-shrink: 0;
}

.meal-notes {
  font-size: 0.72rem;
  color: var(--ink-muted);
  font-style: italic;
  margin-top: 0.3rem;
  padding-top: 0.3rem;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.meal-alt {
  margin-top: 0.6rem;
}

.alt-toggle {
  font-size: 0.7rem;
  color: var(--ink-muted);
  padding: 0;

  &:hover {
    color: var(--ink);
  }
}

.alt-body {
  margin-top: 0.4rem;
}
</style>
