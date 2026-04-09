<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useBudgetStore } from '../stores/useBudgetStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import { usePigSystem } from '../composables/usePigSystem.js';
import PigPixelArt from '../components/PigPixelArt.vue';
import PigBackground from '../components/PigBackground.vue';

const store = useBudgetStore();
const authStore = useAuthStore();
const router = useRouter();
const { getPigState, getHouseInfo, formatCurrency } = usePigSystem();

const pigState = computed(() =>
  getPigState(store.todayExpense, store.dailyBudget)
);

const pigVisualScale = computed(() => {
  const level = pigState.value.level ?? 1;
  const normalized = Math.min(Math.max(level, 1), 10);
  return 0.82 + (normalized - 1) * 0.04;
});

const currentHouseLevel = computed(() => authStore.currentUser?.houseLevel ?? 3);
const houseInfo = computed(() => getHouseInfo(currentHouseLevel.value));

const monthlyBudget = computed(() => {
  if (!authStore.currentUser) return 0;
  return Math.round(
    (authStore.currentUser.monthlyIncome * authStore.currentUser.targetExpenseRatio) / 100
  );
});

const monthlyProgress = computed(() => {
  if (!monthlyBudget.value) return 0;
  return Math.min(
    Math.round((store.totalExpenseThisMonth / monthlyBudget.value) * 100),
    100
  );
});

const todayProgressPercent = computed(() => {
  if (!store.dailyBudget) return 0;
  return Math.min(
    Math.round((store.todayExpense / store.dailyBudget) * 100),
    100
  );
});

const todayRecordsSorted = computed(() =>
  [...store.todayRecords].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )
);
</script>

<template>
  <div class="home-page">
    <!-- ─── 상단 헤더 ─── -->
    <header class="page-header">
      <div>
        <h1 class="page-title">🐷 돈독</h1>
        <p class="page-subtitle">
          {{ authStore.currentUser?.userName ?? '...' }}님의 재정
        </p>
      </div>
      <div class="house-badge" :title="houseInfo.description">
        <span class="house-emoji">{{ houseInfo.emoji }}</span>
        <span class="house-name">{{ houseInfo.name }}</span>
      </div>
    </header>

    <!-- ─── 로딩 ─── -->
    <div v-if="store.loading" class="loading-state">
      <div class="loading-pig">🐷</div>
      <p>데이터 불러오는 중...</p>
    </div>

    <!-- ─── 에러 ─── -->
    <div v-else-if="store.error" class="error-card">
      <p>⚠️ {{ store.error }}</p>
      <p class="error-hint">json-server가 실행 중인지 확인해주세요</p>
      <code>npm run server</code>
    </div>

    <template v-else>
      <!-- ─── 메인 돼지 카드 ─── -->
        <div
        class="pig-hero-card"
        :style="{
          '--pig-color': pigState.color,
          '--pig-bg': pigState.bgColor,
          '--pig-border': pigState.borderColor,
          '--pig-scale': pigVisualScale,
        }"
      >
        <!-- 레벨 + 상태 라벨 -->
        <div class="pig-meta-row">
          <span class="pig-level-chip" :style="{ background: pigState.color }">
            Lv.{{ pigState.level }}
          </span>
          <span class="pig-label" :style="{ color: pigState.color }">
            {{ pigState.label }}
          </span>
          <span class="pig-ratio-chip">
            오늘 {{ pigState.ratio ?? 0 }}% 사용
          </span>
        </div>

        <!-- 픽셀 아트 돼지 (크게!) -->
        <div class="pig-display-wrap">
          <PigBackground
            :house-level="currentHouseLevel"
            :scale="pigVisualScale"
            class="pig-bg-layer"
          />
          <PigPixelArt :level="pigState.level" class="pig-pixel" />
        </div>

        <!-- 피드백 메시지 -->
        <p class="pig-message">{{ pigState.message }}</p>

        <!-- 오늘 지출 진행바 -->
        <div class="progress-section">
          <div class="progress-row">
            <span class="progress-label">오늘 지출</span>
            <span class="progress-values">
              <strong :style="{ color: pigState.color }">{{
                formatCurrency(store.todayExpense)
              }}</strong>
              <span class="progress-slash">/</span>
              {{ formatCurrency(store.dailyBudget) }}
            </span>
          </div>
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{
                width: todayProgressPercent + '%',
                background: pigState.color,
              }"
            />
          </div>
        </div>
      </div>

      <!-- ─── 이번 달 요약 ─── -->
      <div class="summary-row">
        <div class="summary-card income-card">
          <p class="s-label">이번 달 수입</p>
          <p class="s-value">
            +{{ formatCurrency(store.totalIncomeThisMonth) }}
          </p>
        </div>
        <div class="summary-card expense-card">
          <p class="s-label">이번 달 지출</p>
          <p class="s-value">
            -{{ formatCurrency(store.totalExpenseThisMonth) }}
          </p>
        </div>
      </div>

      <!-- ─── 월간 예산 현황 ─── -->
      <div class="card">
        <div class="card-header">
          <span>📅 {{ store.currentMonth }} 예산 현황</span>
          <span
            class="budget-pct"
            :style="{ color: monthlyProgress > 100 ? '#EF5350' : '#66BB6A' }"
            >{{ monthlyProgress }}%</span
          >
        </div>
        <div class="progress-row" style="margin-bottom: 6px">
          <span class="text-sm">{{
            formatCurrency(store.totalExpenseThisMonth)
          }}</span>
          <span class="text-sm text-muted"
            >/ {{ formatCurrency(monthlyBudget) }}</span
          >
        </div>
        <div class="progress-track">
          <div
            class="progress-fill"
            :style="{
              width: monthlyProgress + '%',
              background:
                monthlyProgress > 100
                  ? '#EF5350'
                  : monthlyProgress > 80
                  ? '#FFA726'
                  : '#66BB6A',
            }"
          />
        </div>
        <p
          class="net-label"
          :class="store.monthlyNetIncome >= 0 ? 'positive' : 'negative'"
        >
          순수익 {{ store.monthlyNetIncome >= 0 ? '+' : ''
          }}{{ formatCurrency(store.monthlyNetIncome) }}
        </p>
      </div>

      <!-- ─── 오늘의 거래 ─── -->
      <div class="card">
        <div class="card-header">
          <span>📋 오늘의 거래</span>
          <button class="link-btn" @click="router.push('/account')">
            전체보기 →
          </button>
        </div>

        <div v-if="todayRecordsSorted.length === 0" class="empty-state">
          <p>오늘 거래 내역이 없어요</p>
          <button class="btn-add" @click="router.push('/account')">
            + 추가하기
          </button>
        </div>

        <ul v-else class="record-list">
          <li
            v-for="rec in todayRecordsSorted.slice(0, 5)"
            :key="rec.id"
            class="record-item"
          >
            <div class="record-left">
              <span class="record-dot" :class="rec.type" />
              <div>
                <p class="record-cat">{{ rec.category }}</p>
                <p class="record-memo">{{ rec.memo || '-' }}</p>
              </div>
            </div>
            <span class="record-amount" :class="rec.type">
              {{ rec.type === 'income' ? '+' : '-'
              }}{{ formatCurrency(rec.amount) }}
            </span>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.25rem 0;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
}

.page-subtitle {
  font-size: 0.78rem;
  color: var(--text-muted);
  margin: 0;
}

.house-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0.4rem 0.8rem;
  cursor: default;
}

.house-emoji {
  font-size: 1.5rem;
  line-height: 1;
}
.house-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
}

/* ─── 메인 돼지 히어로 카드 ─── */
.pig-hero-card {
  background: var(--pig-bg, #fff0f5);
  border: 2px solid var(--pig-border, #ff6b9d);
  border-radius: 24px;
  padding: 1rem 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.7rem;
  transition: background 0.4s, border-color 0.4s;
}

.pig-meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
}

.pig-level-chip {
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.pig-label {
  font-size: 1rem;
  font-weight: 700;
}

.pig-ratio-chip {
  background: rgba(0, 0, 0, 0.07);
  font-size: 0.72rem;
  color: var(--text-muted);
  padding: 3px 8px;
  border-radius: 20px;
  font-weight: 600;
}

/* 돼지 픽셀 아트 디스플레이 */
.pig-display-wrap {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  width: 100%;
  min-height: 230px;
  overflow: hidden;
  border-radius: 16px;
}

.pig-bg-layer {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.pig-pixel {
  position: relative;
  z-index: 2;
  width: min(110px, 45%);
  height: auto;
  transform-origin: center bottom;
  filter: drop-shadow(0 6px 12px rgba(0, 0, 0, 0.15));
  /* 돼지가 두둥실 떠오르는 애니메이션 */
  animation: pigFloatScale 3s ease-in-out infinite;
}

@keyframes pigFloatScale {
  0%,
  100% {
    transform: scale(var(--pig-scale, 1)) translateY(0px);
  }
  50% {
    transform: scale(var(--pig-scale, 1)) translateY(-10px);
  }
}

.pig-message {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
  margin: 0;
  line-height: 1.5;
  max-width: 280px;
}

/* Progress */
.progress-section {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.progress-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.progress-values {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.progress-values strong {
  font-size: 0.95rem;
}

.progress-slash {
  margin: 0 4px;
}

.progress-track {
  height: 10px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.6s ease;
  min-width: 4px;
}

/* Summary Row */
.summary-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.summary-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 0.9rem;
  text-align: center;
}

.income-card {
  border-left: 4px solid #66bb6a;
}
.expense-card {
  border-left: 4px solid #ef5350;
}

.s-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin: 0 0 4px;
}
.s-value {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0;
}
.income-card .s-value {
  color: #43a047;
}
.expense-card .s-value {
  color: #e53935;
}

/* Generic card */
.card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.budget-pct {
  font-weight: 700;
  font-size: 0.88rem;
}

.text-sm {
  font-size: 0.82rem;
  color: var(--text);
}
.text-muted {
  color: var(--text-muted);
}

.net-label {
  margin: 0.5rem 0 0;
  font-weight: 700;
  font-size: 0.88rem;
  text-align: right;
}
.net-label.positive {
  color: #43a047;
}
.net-label.negative {
  color: #e53935;
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 600;
}

/* Records */
.record-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.record-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0;
  border-bottom: 1px solid var(--border);
}
.record-item:last-child {
  border-bottom: none;
}

.record-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.record-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.record-dot.income {
  background: #66bb6a;
}
.record-dot.expense {
  background: #ef5350;
}

.record-cat {
  font-size: 0.88rem;
  font-weight: 600;
  margin: 0;
}
.record-memo {
  font-size: 0.74rem;
  color: var(--text-muted);
  margin: 0;
}

.record-amount {
  font-size: 0.9rem;
  font-weight: 700;
}
.record-amount.income {
  color: #43a047;
}
.record-amount.expense {
  color: #e53935;
}

/* Empty / Loading / Error */
.empty-state {
  text-align: center;
  padding: 1.5rem 0;
  color: var(--text-muted);
  font-size: 0.88rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
}

.btn-add {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 20px;
  padding: 0.4rem 1.2rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.loading-state {
  text-align: center;
  padding: 3rem 0;
  color: var(--text-muted);
}

.loading-pig {
  font-size: 3.5rem;
  animation: pigFloat 0.8s ease-in-out infinite;
}

.error-card {
  background: #ffebee;
  border: 1.5px solid #ef9a9a;
  border-radius: 16px;
  padding: 1.2rem;
  text-align: center;
  color: #c62828;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.error-card code {
  background: #fff;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 0.8rem;
  color: #e53935;
}

.error-hint {
  font-size: 0.82rem;
  color: #e57373;
}
</style>
