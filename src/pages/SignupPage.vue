<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  userId: '',
  password: '',
  userName: '',
  age: null,
  monthlyIncome: null,
  targetExpenseRatio: 60
})

const errorMsg = ref('')
const loading = ref(false)

async function handleSignup() {
  errorMsg.value = ''
  
  // 간단한 유효성 검사
  if (!form.userId.trim() || !form.password.trim() || !form.userName.trim()) {
    errorMsg.value = '필수 항목을 모두 입력해주세요'
    return
  }
  
  if (form.age === null || form.monthlyIncome === null) {
    errorMsg.value = '나이와 월 수입을 입력해주세요'
    return
  }

  try {
    loading.value = true
    await authStore.signup({
      ...form,
      userId: form.userId.trim(),
      age: Number(form.age),
      monthlyIncome: Number(form.monthlyIncome),
      targetExpenseRatio: Number(form.targetExpenseRatio)
    })
    alert('회원가입이 완료되었습니다! 로그인해주세요.')
    router.push('/login')
  } catch (e) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="signup-page">
    <div class="signup-card">
      <div class="signup-header">
        <h1 class="page-title">회원가입</h1>
        <p class="page-subtitle">돈독과 함께 똑똑한 소비 습관을 만들어요</p>
      </div>

      <form class="signup-form" @submit.prevent="handleSignup">
        <div class="form-grid">
          <div class="form-group">
            <label>아이디 *</label>
            <input v-model="form.userId" type="text" class="form-input" placeholder="아이디" required />
          </div>

          <div class="form-group">
            <label>비밀번호 *</label>
            <input v-model="form.password" type="password" class="form-input" placeholder="비밀번호" required />
          </div>

          <div class="form-group">
            <label>이름 *</label>
            <input v-model="form.userName" type="text" class="form-input" placeholder="홍길동" required />
          </div>

          <div class="form-group">
            <label>나이 *</label>
            <input v-model="form.age" type="number" class="form-input" placeholder="25" required />
          </div>

          <div class="form-group">
            <label>월 수입 (원) *</label>
            <input v-model="form.monthlyIncome" type="number" class="form-input" placeholder="3000000" required />
          </div>

          <div class="form-group">
            <label>목표 지출 비율 (%)</label>
            <input v-model="form.targetExpenseRatio" type="number" class="form-input" placeholder="60" />
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</p>

        <div class="actions">
          <button type="submit" class="btn-signup" :disabled="loading">
            <span v-if="loading">가입 중...</span>
            <span v-else>회원가입</span>
          </button>
          <button type="button" class="btn-back" @click="router.push('/login')">
            로그인으로 돌아가기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.signup-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-main);
  padding: 1.5rem;
}

.signup-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 24px;
  padding: 2.5rem 2rem;
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.signup-header {
  text-align: center;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--primary);
  margin: 0;
}

.page-subtitle {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0.5rem 0 0;
}

.signup-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 400px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
}

.form-input {
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0.7rem 0.9rem;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  font-family: inherit;
  width: 100%;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: var(--primary);
}

.error-msg {
  font-size: 0.82rem;
  color: #E53935;
  margin: 0;
  text-align: center;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.btn-signup {
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 0.9rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.2s;
  width: 100%;
}

.btn-signup:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-back {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-decoration: underline;
  cursor: pointer;
}
</style>
