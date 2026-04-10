<script setup>
import { computed } from 'vue';
import { useBudgetStore } from '../stores/useBudgetStore.js';
import { usePigSystem } from '../composables/usePigSystem.js';

const store = useBudgetStore();
const { getCharacterStage, formatCurrency } = usePigSystem();

const props = defineProps({
  selectedMonth: { type: String, required: true },
});

const monthlyExpense = computed(() =>
  store.records
    .filter(
      (r) => r.date.startsWith(props.selectedMonth) && r.type === 'expense',
    )
    .reduce((s, r) => s + r.amount, 0),
);

const character = computed(() =>
  getCharacterStage(monthlyExpense.value, store.dailyBudget, props.selectedMonth),
);
</script>

<template>
  <div v-if="character" class="character-badge" :class="'effect-' + character.effect">
    <img :src="character.image" :alt="character.name" class="character-img" />
    <div class="character-info">
      <div class="character-top">
        <span class="character-name">{{ character.name }}</span>
        <span class="pace-badge" :class="'effect-' + character.effect">
          페이스 {{ character.pace }}x
        </span>
      </div>
      <p class="character-message">{{ character.message }}</p>
    </div>
  </div>
</template>

<style scoped>
.character-badge {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 0.8rem 1rem;
}

.character-badge.effect-good {
  border-color: #66BB6A;
  background: #F1F8E9;
}

.character-badge.effect-bad {
  border-color: #EF5350;
  background: #FFF5F5;
}

.character-badge.effect-neutral {
  border-color: var(--border);
  background: #FAFAFA;
}

.character-img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  image-rendering: pixelated;
  flex-shrink: 0;
}

.character-info {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  min-width: 0;
}

.character-top {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.character-name {
  font-size: 1rem;
  font-weight: 800;
  color: var(--text);
}

.pace-badge {
  font-size: 0.72rem;
  font-weight: 700;
  border-radius: 6px;
  padding: 2px 7px;
}

.pace-badge.effect-good {
  background: #C8E6C9;
  color: #2E7D32;
}

.pace-badge.effect-bad {
  background: #FFCDD2;
  color: #C62828;
}

.pace-badge.effect-neutral {
  background: #ECEFF1;
  color: #546E7A;
}

.character-message {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.4;
}
</style>
