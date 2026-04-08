<script setup>
import { computed } from 'vue';
import { useBudgetStore } from '../stores/useBudgetStore.js';
import { usePigSystem } from '../composables/usePigSystem.js';

const props = defineProps({
  selectedMonth: { type: String, required: true },
});

const store = useBudgetStore();
const { formatCurrency } = usePigSystem();

const monthRecords = computed(() =>
  store.records.filter((r) => r.date.startsWith(props.selectedMonth)),
);

const incomeRecords = computed(() =>
  monthRecords.value.filter((r) => r.type === 'income'),
);
const expenseRecords = computed(() =>
  monthRecords.value.filter((r) => r.type === 'expense'),
);

const totalIncome = computed(() =>
  incomeRecords.value.reduce((s, r) => s + r.amount, 0),
);
const totalExpense = computed(() =>
  expenseRecords.value.reduce((s, r) => s + r.amount, 0),
);
const netIncome = computed(() => totalIncome.value - totalExpense.value);

// 수입 카테고리별 통계
const incomeByCat = computed(() => {
  const map = {};
  incomeRecords.value.forEach((r) => {
    map[r.category] = (map[r.category] || 0) + r.amount;
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      icon:
        store.incomeCategories.find((c) => c.name === category)?.icon ?? '💰',
      ratio: totalIncome.value
        ? Math.round((amount / totalIncome.value) * 100)
        : 0,
    }));
});

// 지출 카테고리별 통계
const expenseByCat = computed(() => {
  const map = {};
  expenseRecords.value.forEach((r) => {
    map[r.category] = (map[r.category] || 0) + r.amount;
  });
  return Object.entries(map)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount,
      icon:
        store.expenseCategories.find((c) => c.name === category)?.icon ?? '💸',
      ratio: totalExpense.value
        ? Math.round((amount / totalExpense.value) * 100)
        : 0,
    }));
});

const savingRate = computed(() => {
  if (!totalIncome.value) return 0;
  return Math.max(0, Math.round((netIncome.value / totalIncome.value) * 100));
});

const transactionCount = computed(() => monthRecords.value.length);
const avgDailyExpense = computed(() => {
  const days = new Set(expenseRecords.value.map((r) => r.date)).size;
  return days > 0 ? Math.round(totalExpense.value / days) : 0;
});
</script>

<template>
  <div class="summary-view">
    <!-- 핵심 지표 -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <p class="kpi-label" title="총 수입">총 수입</p>
        <p class="kpi-value income" :title="`+${formatCurrency(totalIncome)}`">
          +{{ formatCurrency(totalIncome) }}
        </p>
      </div>
      <div class="kpi-card">
        <p class="kpi-label" title="총 지출">총 지출</p>
        <p
          class="kpi-value expense"
          :title="`-${formatCurrency(totalExpense)}`"
        >
          -{{ formatCurrency(totalExpense) }}
        </p>
      </div>
      <div class="kpi-card">
        <p class="kpi-label" title="순수익">순수익</p>
        <p
          class="kpi-value"
          :class="netIncome >= 0 ? 'income' : 'expense'"
          :title="`${netIncome >= 0 ? '+' : ''}${formatCurrency(netIncome)}`"
        >
          {{ netIncome >= 0 ? '+' : '' }}{{ formatCurrency(netIncome) }}
        </p>
      </div>
      <div class="kpi-card">
        <p class="kpi-label" title="저축률">저축률</p>
        <p
          class="kpi-value"
          :class="savingRate >= 20 ? 'income' : 'expense'"
          :title="`${savingRate}%`"
        >
          {{ savingRate }}%
        </p>
      </div>
      <div class="kpi-card">
        <p class="kpi-label" title="거래 건수">거래 건수</p>
        <p class="kpi-value neutral" :title="`${transactionCount}건`">
          {{ transactionCount }}건
        </p>
      </div>
      <div class="kpi-card">
        <p class="kpi-label" title="일평균 지출">일평균 지출</p>
        <p class="kpi-value expense" :title="formatCurrency(avgDailyExpense)">
          {{ formatCurrency(avgDailyExpense) }}
        </p>
      </div>
    </div>

    <!-- 수입 구성 -->
    <div v-if="incomeByCat.length > 0" class="chart-card">
      <p class="chart-title">💰 수입 구성</p>
      <div class="bar-chart">
        <div v-for="cat in incomeByCat" :key="cat.category" class="bar-row">
          <div class="bar-label">
            <span :title="`${cat.icon} ${cat.category}`"
              >{{ cat.icon }} {{ cat.category }}</span
            >
            <span class="bar-pct">{{ cat.ratio }}%</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill income"
              :style="{ width: cat.ratio + '%' }"
            ></div>
          </div>
          <span class="bar-amount" :title="formatCurrency(cat.amount)">{{
            formatCurrency(cat.amount)
          }}</span>
        </div>
      </div>
    </div>

    <!-- 지출 구성 -->
    <div v-if="expenseByCat.length > 0" class="chart-card">
      <p class="chart-title">💸 지출 구성</p>
      <div class="bar-chart">
        <div v-for="cat in expenseByCat" :key="cat.category" class="bar-row">
          <div class="bar-label">
            <span :title="`${cat.icon} ${cat.category}`"
              >{{ cat.icon }} {{ cat.category }}</span
            >
            <span class="bar-pct">{{ cat.ratio }}%</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill expense"
              :style="{ width: cat.ratio + '%' }"
            ></div>
          </div>
          <span class="bar-amount" :title="formatCurrency(cat.amount)">{{
            formatCurrency(cat.amount)
          }}</span>
        </div>
      </div>
    </div>

    <div v-if="monthRecords.length === 0" class="empty">
      <p>📊 이달 데이터가 없어요</p>
    </div>
  </div>
</template>

<style scoped>
.summary-view {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* KPI Grid */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.kpi-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 0.7rem 0.4rem;
  text-align: center;
  min-width: 0; /* 자식의 overflow 처리를 위해 필요 */
}

.kpi-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin: 0 0 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-value {
  font-size: 0.85rem;
  font-weight: 700;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.kpi-value.income {
  color: #43a047;
}
.kpi-value.expense {
  color: #e53935;
}
.kpi-value.neutral {
  color: var(--text);
}

/* Bar Chart */
.chart-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
}

.chart-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0 0 0.8rem;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.bar-row {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bar-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.78rem;
  color: var(--text-muted);
  gap: 8px;
}

.bar-pct {
  font-weight: 700;
  flex-shrink: 0;
}

.bar-track {
  height: 10px;
  background: var(--bg-main);
  border-radius: 99px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.bar-fill.income {
  background: #66bb6a;
}
.bar-fill.expense {
  background: #ef5350;
}

.bar-amount {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--text);
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty {
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
}
</style>
