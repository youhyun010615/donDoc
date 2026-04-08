<script setup>
import { computed, ref } from 'vue';
import { useBudgetStore } from '../stores/useBudgetStore.js';
import { usePigSystem } from '../composables/usePigSystem.js';

const store = useBudgetStore();
const { formatCurrency } = usePigSystem();

const props = defineProps({
  selectedMonth: { type: String, required: true },
  filterType: { type: String, default: 'all' },
});

const emit = defineEmits([
  'update:selectedMonth',
  'update:filterType',
  'addClick',
]);

const isOpen = ref(false);

// 2. 항목 선택 시 실행될 함수
const selectMonth = (m) => {
  emit('update:selectedMonth', m); // 부모 컴포넌트의 selectedMonth 업데이트
  isOpen.value = false; // 선택 후 목록 닫기
};

// 드롭다운 외부 클릭 시 닫기 위해 (선택사항)
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const months = computed(() => {
  const result = [];
  const now = new Date();
  const oldestDate = new Date(
    [...store.records].sort((a, b) => a.date.localeCompare(b.date))[0].date,
  );
  const diff =
    (now.getFullYear() - oldestDate.getFullYear()) * 12 +
    (now.getMonth() - oldestDate.getMonth());

  for (let i = diff; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    result.push(d.toISOString().slice(0, 7));
  }
  return result;
});

const monthlyIncome = computed(() =>
  store.records
    .filter(
      (r) => r.date.startsWith(props.selectedMonth) && r.type === 'income',
    )
    .reduce((s, r) => s + r.amount, 0),
);

const monthlyExpense = computed(() =>
  store.records
    .filter(
      (r) => r.date.startsWith(props.selectedMonth) && r.type === 'expense',
    )
    .reduce((s, r) => s + r.amount, 0),
);
</script>

<template>
  <div class="account-header">
    <!-- 월 선택 -->
    <!-- <div class="month-selector">
      <select
        :value="selectedMonth"
        @change="$emit('update:selectedMonth', $event.target.value)"
        class="month-select"
      >
        <option value="">모든 월 보기</option>
        <option v-for="m in months" :key="m" :value="m">{{ m }}</option>
      </select>
    </div> -->

    <div class="month-selector">
      <!-- 현재 선택된 값을 보여주는 박스 (기존 .month-select 디자인 적용) -->
      <div class="custom-select-box" @click="isOpen = !isOpen">
        {{ selectedMonth === '' ? '모든 월 보기' : selectedMonth }}
        <span class="arrow">{{ isOpen ? '▲' : '▼' }}</span>
      </div>

      <!-- 드롭다운 목록 -->
      <div v-if="isOpen" class="custom-options">
        <div
          class="custom-option"
          :class="{ active: selectedMonth === '' }"
          @click="selectMonth('')"
        >
          모든 월 보기
        </div>
        <div
          v-for="m in months"
          :key="m"
          class="custom-option"
          :class="{ active: selectedMonth === m }"
          @click="selectMonth(m)"
        >
          {{ m }}
        </div>
      </div>
    </div>

    <!-- 월간 요약 -->
    <div class="month-summary">
      <div class="summary-item income">
        <span class="s-label">수입</span>
        <span class="s-value">+{{ formatCurrency(monthlyIncome) }}</span>
      </div>
      <div class="divider"></div>
      <div class="summary-item expense">
        <span class="s-label">지출</span>
        <span class="s-value">-{{ formatCurrency(monthlyExpense) }}</span>
      </div>
      <div class="divider"></div>
      <div class="summary-item net">
        <span class="s-label">합계</span>
        <span
          class="s-value"
          :class="monthlyIncome - monthlyExpense >= 0 ? 'positive' : 'negative'"
        >
          {{ monthlyIncome - monthlyExpense >= 0 ? '+' : ''
          }}{{ formatCurrency(monthlyIncome - monthlyExpense) }}
        </span>
      </div>
    </div>

    <!-- 필터 탭 + 추가 버튼 -->
    <div class="filter-row">
      <div class="filter-tabs">
        <button
          class="filter-tab"
          :class="{ active: filterType === 'all' }"
          @click="$emit('update:filterType', 'all')"
        >
          전체
        </button>
        <button
          class="filter-tab"
          :class="{ active: filterType === 'income' }"
          @click="$emit('update:filterType', 'income')"
        >
          수입
        </button>
        <button
          class="filter-tab"
          :class="{ active: filterType === 'expense' }"
          @click="$emit('update:filterType', 'expense')"
        >
          지출
        </button>
      </div>
      <button class="add-btn" @click="$emit('addClick')">+ 추가</button>
    </div>
  </div>
</template>

<style scoped>
.account-header {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.month-select {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  background: var(--bg-main);
  cursor: pointer;
  outline: none;
  font-family: inherit;
  width: 100%;
}

.month-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.divider {
  width: 1px;
  height: 30px;
  background: var(--border);
}

.s-label {
  font-size: 0.72rem;
  color: var(--text-muted);
}

.s-value {
  font-size: 0.88rem;
  font-weight: 700;
}

.summary-item.income .s-value {
  color: #43a047;
}
.summary-item.expense .s-value {
  color: #e53935;
}
.s-value.positive {
  color: #43a047;
}
.s-value.negative {
  color: #e53935;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-tabs {
  display: flex;
  background: var(--bg-main);
  border-radius: 10px;
  padding: 3px;
  flex: 1;
}

.filter-tab {
  flex: 1;
  border: none;
  border-radius: 8px;
  padding: 0.4rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--text-muted);
  transition: all 0.2s;
}

.filter-tab.active {
  background: #fff;
  color: var(--primary);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1);
}

.add-btn {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 0.5rem 0.9rem;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
.month-selector {
  position: relative;
  width: 100%;
}

/* 기존 .month-select 스타일을 그대로 가져옴 */
.custom-select-box {
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  background: var(--bg-main);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 드롭다운 목록 상자 */
.custom-options {
  position: absolute;
  top: 110%; /* 살짝 띄움 */
  left: 0;
  width: 100%;
  background: var(--bg-main);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  z-index: 100;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 개별 옵션 디자인 (여기서 마음껏 수정 가능!) */
.custom-option {
  padding: 0.6rem 0.8rem;
  font-size: 0.9rem;
  color: var(--text);
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 600;
}

.custom-option:hover {
  background: var(--border); /* 마우스 올렸을 때 */
}

.custom-option.active {
  background: var(--border);
  color: var(--point-color, #3b82f6); /* 선택된 상태 강조 */
}

.arrow {
  font-size: 0.7rem;
  transition: transform 0.2s;
}
</style>
