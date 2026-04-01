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
      <div v-if="displayProteinLabel" class="meal-item protein">
        <span class="item-dot">●</span>
        <button
          v-if="canChangeProtein"
          class="protein-label-btn"
          :class="{ 'is-overridden': overrideProteinLabel }"
          @click.stop="$emit('change-protein')"
        >{{ displayProteinLabel }}<em v-if="displayProteinG"> {{ displayProteinG }}g</em></button>
        <span v-else>{{ displayProteinLabel }}<em v-if="displayProteinG"> {{ displayProteinG }}g</em></span>
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
import { computed } from 'vue'

const props = defineProps({
  meal:                { type: Object, required: true },
  label:               { type: String, default: '' },
  selectedCarb:        { type: Object, default: null },  // { label, g } dal log
  canChangeProtein:    { type: Boolean, default: false },
  overrideProteinLabel: { type: String, default: null }, // label override dal log
  overrideProteinG:    { type: [Number, String], default: null },
})

defineEmits(['change-protein'])

const displayProteinLabel = computed(() =>
  props.overrideProteinLabel ?? props.meal.proteinLabel
)
const displayProteinG = computed(() =>
  props.overrideProteinLabel ? props.overrideProteinG : props.meal.proteinG
)
</script>
