<template>
  <div class="meal-slot" :class="`pattern-${meal.patternKey}`">
    <div class="meal-header">
      <span class="meal-label">{{ label }}</span>
      <span class="pattern-badge">{{ meal.patternKey }}</span>
      <slot name="actions" />
    </div>

    <div v-if="meal.patternKey === 'T4'" class="meal-free">
      libero
    </div>

    <div v-else class="meal-body">
      <div v-if="meal.patternKey === 'T1' && !meal.pane" class="meal-item carb">
        <span class="item-dot">●</span>
        <span v-if="selectedCarb">{{ selectedCarb.label }}<em v-if="selectedCarb.g"> {{ selectedCarb.g }}g</em></span>
        <span v-else class="carb-placeholder">carboidrato</span>
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

  </div>
</template>

<script setup>
defineProps({
  meal:        { type: Object, required: true },
  label:       { type: String, default: '' },
  selectedCarb: { type: Object, default: null }, // { label, g } dal log
})
</script>
