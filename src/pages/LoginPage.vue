<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  loginId: '',
  password: '',
})

const formError = ref('')

async function handleLogin() {
  formError.value = ''

  if (!form.loginId.trim() || !form.password.trim()) {
    formError.value = '아이디와 비밀번호를 모두 입력해 주세요.'
    return
  }

  try {
    await authStore.login(form.loginId.trim(), form.password)
    router.push('/')
  } catch {
    formError.value = authStore.error
  }
}
</script>

<template>
  <section class="login-page">
    <div class="login-card">
      <div class="login-badge">Don-Doc</div>
      <h1 class="login-title">돈독한 소비 습관을 위한 로그인</h1>
      <p class="login-subtitle">
        기존 가계부 테마에 맞춘 분홍 톤으로, 오늘 기록부터 바로 이어서 관리할 수 있어요.
      </p>

      <div class="demo-box">
        <p class="demo-title">테스트 계정</p>
        <p class="demo-value">아이디 demo / 비밀번호 1234</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <label class="field">
          <span class="field-label">아이디</span>
          <input
            v-model="form.loginId"
            type="text"
            class="field-input"
            placeholder="아이디를 입력해 주세요"
            autocomplete="username"
          />
        </label>

        <label class="field">
          <span class="field-label">비밀번호</span>
          <input
            v-model="form.password"
            type="password"
            class="field-input"
            placeholder="비밀번호를 입력해 주세요"
            autocomplete="current-password"
          />
        </label>

        <p v-if="formError" class="error-text">{{ formError }}</p>

        <button type="submit" class="login-button" :disabled="authStore.loading">
          {{ authStore.loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.login-page {
  min-height: calc(100vh - 3rem);
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 100%;
  background:
    radial-gradient(circle at top right, rgba(255, 179, 71, 0.25), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #fff7fb 100%);
  border: 1.5px solid var(--border);
  border-radius: 28px;
  box-shadow: var(--shadow);
  padding: 2rem 1.25rem;
}

.login-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.04em;
}

.login-title {
  margin: 1rem 0 0.55rem;
  font-size: 1.8rem;
  line-height: 1.25;
  color: var(--text);
}

.login-subtitle {
  color: var(--text-muted);
  font-size: 0.92rem;
}

.demo-box {
  margin-top: 1.25rem;
  padding: 0.9rem 1rem;
  background: rgba(255, 107, 157, 0.08);
  border: 1px solid rgba(255, 107, 157, 0.14);
  border-radius: 18px;
}

.demo-title {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--primary-dark);
}

.demo-value {
  margin-top: 0.2rem;
  font-size: 0.9rem;
  color: var(--text);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 1.4rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-muted);
}

.field-input {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 0.9rem 1rem;
  background: #fff;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.field-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(255, 107, 157, 0.12);
}

.error-text {
  color: #e53935;
  font-size: 0.82rem;
}

.login-button {
  margin-top: 0.35rem;
  border: none;
  border-radius: 16px;
  padding: 0.95rem 1rem;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  color: #fff;
  font-size: 0.96rem;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(255, 107, 157, 0.2);
  transition: transform 0.2s, opacity 0.2s;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.75;
  cursor: not-allowed;
}
</style>
