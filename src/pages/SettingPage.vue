<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBudgetStore } from '../stores/useBudgetStore.js'
import { useAuthStore } from '../stores/useAuthStore.js'
import { usePigSystem } from '../composables/usePigSystem.js'

const router = useRouter()
const store = useBudgetStore()
const authStore = useAuthStore()
const { getHouseInfo, formatCurrency } = usePigSystem()

const form = ref({
  userName: '',
  monthlyIncome: '',
  targetExpenseRatio: 50,
})

const saved = ref(false)
const errorMsg = ref('')

// 프로필이 로드되면 폼 초기화
watch(
  () => store.profile,
  (profile) => {
    if (profile) {
      form.value = {
        userName: profile.userName,
        monthlyIncome: profile.monthlyIncome,
        targetExpenseRatio: profile.targetExpenseRatio,
      }
    }
  },
  { immediate: true }
)

const monthlyBudget = computed(() => {
  const income = Number(form.value.monthlyIncome) || 0
  const ratio = Number(form.value.targetExpenseRatio) || 0
  return Math.round((income * ratio) / 100)
})

const dailyBudget = computed(() => Math.round(monthlyBudget.value / 30))

const houseInfo = computed(() => getHouseInfo(store.profile?.houseLevel ?? 1))

async function handleSave() {
  errorMsg.value = ''
  if (!form.value.userName.trim()) {
    errorMsg.value = '이름을 입력해주세요'
    return
  }
  if (!form.value.monthlyIncome || Number(form.value.monthlyIncome) <= 0) {
    errorMsg.value = '월 소득을 올바르게 입력해주세요'
    return
  }
  if (form.value.targetExpenseRatio < 10 || form.value.targetExpenseRatio > 100) {
    errorMsg.value = '지출 목표 비율은 10~100% 사이로 설정해주세요'
    return
  }

  try {
    await store.updateProfile({
      userName: form.value.userName.trim(),
      monthlyIncome: Number(form.value.monthlyIncome),
      targetExpenseRatio: Number(form.value.targetExpenseRatio),
    })
    saved.value = true
    setTimeout(() => { saved.value = false }, 2000)
  } catch (e) {
    errorMsg.value = '저장에 실패했어요. 다시 시도해주세요.'
  }
}

function handleLogout() {
  const shouldLogout = window.confirm('로그아웃하시겠어요?')

  if (!shouldLogout) return

  authStore.logout()
  router.replace('/login')
}

const HOUSE_LEVELS = [
  { level: 1, name: '흙바닥', emoji: '🪨' },
  { level: 2, name: '오두막', emoji: '🛖' },
  { level: 3, name: '집', emoji: '🏠' },
  { level: 4, name: '빌라', emoji: '🏢' },
  { level: 5, name: '대저택', emoji: '🏰' },
]
</script>

<template>
  <div class="setting-page">
    <h1 class="page-title">⚙️ 설정</h1>

    <!-- 현재 집 상태 -->
    <div class="house-showcase">
      <div class="house-display">
        <span class="showcase-emoji">{{ houseInfo.emoji }}</span>
        <div>
          <p class="showcase-name">{{ houseInfo.name }}</p>
          <p class="showcase-desc">{{ houseInfo.description }}</p>
        </div>
      </div>
      <div class="house-progress">
        <div
          v-for="h in HOUSE_LEVELS"
          :key="h.level"
          class="house-step"
          :class="{ active: h.level <= (store.profile?.houseLevel ?? 1), current: h.level === (store.profile?.houseLevel ?? 1) }"
        >
          <span class="step-emoji">{{ h.emoji }}</span>
          <span class="step-name">{{ h.name }}</span>
        </div>
      </div>
    </div>

    <!-- 프로필 설정 폼 -->
    <div class="setting-card">
      <h2 class="card-title">👤 프로필 설정</h2>

      <form @submit.prevent="handleSave" class="setting-form">
        <!-- 이름 -->
        <div class="form-group">
          <label>이름</label>
          <input
            type="text"
            v-model="form.userName"
            class="form-input"
            placeholder="이름을 입력하세요"
            maxlength="20"
          />
        </div>

        <!-- 월 소득 -->
        <div class="form-group">
          <label>월 소득</label>
          <div class="input-wrap">
            <input
              type="number"
              v-model="form.monthlyIncome"
              class="form-input"
              placeholder="0"
              min="0"
            />
            <span class="unit">원</span>
          </div>
        </div>

        <!-- 목표 지출 비율 -->
        <div class="form-group">
          <label>
            목표 지출 비율
            <span class="ratio-badge">{{ form.targetExpenseRatio }}%</span>
          </label>
          <input
            type="range"
            v-model.number="form.targetExpenseRatio"
            class="range-input"
            min="10"
            max="100"
            step="5"
          />
          <div class="range-labels">
            <span>절약 (10%)</span>
            <span>보통 (50%)</span>
            <span>여유 (100%)</span>
          </div>
        </div>

        <!-- 예산 미리보기 -->
        <div class="budget-preview">
          <div class="preview-row">
            <span>📅 월 목표 지출</span>
            <strong>{{ formatCurrency(monthlyBudget) }}</strong>
          </div>
          <div class="preview-row">
            <span>📆 일일 권장 지출</span>
            <strong>{{ formatCurrency(dailyBudget) }}</strong>
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</p>

        <button type="submit" class="btn-save" :disabled="store.loading">
          <span v-if="saved">✅ 저장완료!</span>
          <span v-else-if="store.loading">저장 중...</span>
          <span v-else>저장하기</span>
        </button>
      </form>
    </div>

    <!-- 앱 정보 -->
    <div class="info-card">
      <h2 class="card-title">ℹ️ 앱 정보</h2>
      <div class="info-list">
        <div class="info-row">
          <span>앱 이름</span>
          <span>🐷 돈독 (Don-Doc)</span>
        </div>
        <div class="info-row">
          <span>버전</span>
          <span>v1.0.0</span>
        </div>
        <div class="info-row">
          <span>개발 기간</span>
          <span>2026.04.07 ~ 04.13</span>
        </div>
        <div class="info-row">
          <span>팀장</span>
          <span>유현</span>
        </div>
      </div>
      <p class="info-desc">
        "내 소비의 주치의, 돼지 건강으로 보는 나의 재정 상태"
      </p>
    </div>

    <div class="logout-card">
      <div class="logout-copy">
        <h2 class="card-title">계정</h2>
        <p class="logout-desc">
          현재 로그인: {{ authStore.currentUser?.name || authStore.currentUser?.loginId || '사용자' }}
        </p>
      </div>
      <button type="button" class="btn-logout" @click="handleLogout">
        로그아웃
      </button>
    </div>

    <!-- 돼지 상태 가이드 -->
    <div class="guide-card">
      <h2 class="card-title">🐷 돼지 상태 가이드</h2>
      <div class="guide-list">
        <div class="guide-row">
          <span class="g-face">😄</span>
          <div class="g-info">
            <span class="g-label">완벽 (Lv.10)</span>
            <span class="g-range">일일 지출 0~70%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">😊</span>
          <div class="g-info">
            <span class="g-label">우수 (Lv.9)</span>
            <span class="g-range">70~80%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">🙂</span>
          <div class="g-info">
            <span class="g-label">좋음 (Lv.8)</span>
            <span class="g-range">80~90%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">😐</span>
          <div class="g-info">
            <span class="g-label">평범 (Lv.7)</span>
            <span class="g-range">90~100%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">😕</span>
          <div class="g-info">
            <span class="g-label">주의 (Lv.6)</span>
            <span class="g-range">100~120%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">😟</span>
          <div class="g-info">
            <span class="g-label">경고 (Lv.5)</span>
            <span class="g-range">120~150%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">😰</span>
          <div class="g-info">
            <span class="g-label">위험 (Lv.4)</span>
            <span class="g-range">150~180%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">🤒</span>
          <div class="g-info">
            <span class="g-label">심각 (Lv.3)</span>
            <span class="g-range">180~200%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">🤢</span>
          <div class="g-info">
            <span class="g-label">매우위험 (Lv.2)</span>
            <span class="g-range">200~250%</span>
          </div>
        </div>
        <div class="guide-row">
          <span class="g-face">💀</span>
          <div class="g-info">
            <span class="g-label">위기 (Lv.1)</span>
            <span class="g-range">250% 이상</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.setting-page { display: flex; flex-direction: column; gap: 1rem; }

.page-title {
  font-size: 1.4rem;
  font-weight: 800;
  margin: 0;
}

/* House Showcase */
.house-showcase {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
}

.house-display {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.showcase-emoji { font-size: 2.5rem; }
.showcase-name { font-size: 1rem; font-weight: 700; margin: 0; }
.showcase-desc { font-size: 0.8rem; color: var(--text-muted); margin: 0; }

.house-progress {
  display: flex;
  justify-content: space-between;
  gap: 4px;
}

.house-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  flex: 1;
  opacity: 0.35;
  transition: opacity 0.2s;
}

.house-step.active { opacity: 0.7; }
.house-step.current { opacity: 1; }

.step-emoji { font-size: 1.4rem; }
.step-name { font-size: 0.62rem; font-weight: 600; color: var(--text-muted); text-align: center; }
.house-step.current .step-name { color: var(--primary); }

/* Setting Card */
.setting-card, .info-card, .guide-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
}

.logout-card {
  background: linear-gradient(180deg, #fff 0%, #fff6f8 100%);
  border: 1.5px solid #ffd7e5;
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.logout-copy {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.logout-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.setting-form { display: flex; flex-direction: column; gap: 1rem; }

.form-group { display: flex; flex-direction: column; gap: 0.4rem; }

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.ratio-badge {
  background: var(--primary);
  color: #fff;
  font-size: 0.7rem;
  padding: 2px 8px;
  border-radius: 20px;
}

.form-input {
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0.65rem 0.9rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
}

.form-input:focus { border-color: var(--primary); }

.input-wrap { position: relative; }
.input-wrap .form-input { padding-right: 2.5rem; }
.unit {
  position: absolute;
  right: 0.9rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: var(--text-muted);
  pointer-events: none;
}

.range-input {
  width: 100%;
  accent-color: var(--primary);
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.budget-preview {
  background: var(--bg-main);
  border-radius: 12px;
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}

.preview-row strong { color: var(--primary); }

.error-msg { color: #E53935; font-size: 0.82rem; margin: 0; }

.btn-save {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 0.9rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
}

.btn-save:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-logout {
  border: 1px solid rgba(229, 90, 138, 0.18);
  background: #fff;
  color: var(--primary-dark);
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
}

/* Info Card */
.info-list { display: flex; flex-direction: column; gap: 0; }
.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--border);
  color: var(--text-muted);
}
.info-row:last-child { border-bottom: none; }
.info-row span:last-child { font-weight: 600; color: var(--text); }
.info-desc {
  font-size: 0.78rem;
  color: var(--text-muted);
  font-style: italic;
  text-align: center;
  margin: 0.8rem 0 0;
}

/* Guide Card */
.guide-list { display: flex; flex-direction: column; gap: 0.5rem; }
.guide-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border);
}
.guide-row:last-child { border-bottom: none; }
.g-face { font-size: 1.4rem; }
.g-info { display: flex; flex-direction: column; }
.g-label { font-size: 0.82rem; font-weight: 600; }
.g-range { font-size: 0.73rem; color: var(--text-muted); }
</style>
