<script setup>
import { computed } from 'vue'
import { useBudgetStore } from '../stores/useBudgetStore.js'
import { usePigSystem } from '../composables/usePigSystem.js'

const props = defineProps({
  selectedMonth: { type: String, required: true },
})

const store = useBudgetStore()
const { getPigState, formatCurrency } = usePigSystem()

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토']

// 달력 그리드 생성
const calendarDays = computed(() => {
  const [year, month] = props.selectedMonth.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)

  // 날짜별 지출 맵
  const expenseMap = {}
  store.records
    .filter((r) => r.date.startsWith(props.selectedMonth) && r.type === 'expense')
    .forEach((r) => {
      expenseMap[r.date] = (expenseMap[r.date] || 0) + r.amount
    })

  const days = []

  // 앞 빈 칸
  for (let i = 0; i < firstDay.getDay(); i++) {
    days.push(null)
  }

  // 실제 날짜
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${props.selectedMonth}-${String(d).padStart(2, '0')}`
    const expense = expenseMap[dateStr] || 0
    const pigState = expense > 0 ? getPigState(expense, store.dailyBudget) : null

    const today = new Date().toISOString().slice(0, 10)
    days.push({
      day: d,
      dateStr,
      expense,
      pigState,
      isToday: dateStr === today,
    })
  }

  return days
})

const selectedMonthLabel = computed(() => {
  const [year, month] = props.selectedMonth.split('-')
  return `${year}년 ${parseInt(month)}월`
})
</script>

<template>
  <div class="calendar-log">
    <p class="calendar-title">{{ selectedMonthLabel }}</p>

    <!-- 요일 헤더 -->
    <div class="week-header">
      <span v-for="d in WEEK_DAYS" :key="d" class="week-day" :class="{ sun: d === '일', sat: d === '토' }">
        {{ d }}
      </span>
    </div>

    <!-- 날짜 그리드 -->
    <div class="day-grid">
      <div
        v-for="(day, idx) in calendarDays"
        :key="idx"
        class="day-cell"
        :class="{ empty: !day, today: day?.isToday }"
      >
        <template v-if="day">
          <span class="day-num" :class="{ sun: idx % 7 === 0, sat: idx % 7 === 6 }">
            {{ day.day }}
          </span>
          <span
            v-if="day.pigState"
            class="day-pig"
            :title="day.pigState.label + ': ' + formatCurrency(day.expense)"
          >
            {{ day.pigState.face }}
          </span>
          <span v-if="day.expense > 0" class="day-amount">
            {{ Math.round(day.expense / 1000) }}k
          </span>
        </template>
      </div>
    </div>

    <!-- 범례 -->
    <div class="legend">
      <p class="legend-title">돼지 상태 범례</p>
      <div class="legend-items">
        <span>😄 완벽</span>
        <span>😊 우수</span>
        <span>🙂 좋음</span>
        <span>😐 평범</span>
        <span>😕 주의</span>
        <span>😟 경고↑</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.calendar-log { display: flex; flex-direction: column; gap: 0.8rem; }

.calendar-title {
  text-align: center;
  font-weight: 700;
  font-size: 0.95rem;
  margin: 0;
}

.week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.week-day {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-muted);
  padding: 4px 0;
}
.week-day.sun { color: #EF5350; }
.week-day.sat { color: #1E88E5; }

.day-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 2px;
  min-height: 44px;
  position: relative;
}

.day-cell.today { background: var(--primary-light); }
.day-cell.empty { background: transparent; }

.day-num {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1;
}
.day-num.sun { color: #EF5350; }
.day-num.sat { color: #1E88E5; }

.day-pig { font-size: 1.1rem; line-height: 1; }

.day-amount {
  font-size: 0.58rem;
  color: var(--text-muted);
  margin-top: 1px;
}

/* Legend */
.legend {
  background: var(--bg-main);
  border-radius: 12px;
  padding: 0.8rem;
  margin-top: 0.3rem;
}

.legend-title {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.legend-items span {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
