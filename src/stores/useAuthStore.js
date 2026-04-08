import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { clearStoredAuthUser, getStoredAuthUser, setStoredAuthUser } from '../utils/auth.js'

const API_BASE = 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(getStoredAuthUser())
  const loading = ref(false)
  const error = ref('')

  const isAuthenticated = computed(() => Boolean(currentUser.value))

  async function login(loginId, password) {
    loading.value = true
    error.value = ''

    try {
      const res = await axios.get(`${API_BASE}/users?loginId=${encodeURIComponent(loginId)}&password=${encodeURIComponent(password)}`)
      const user = Array.isArray(res.data) ? res.data[0] : null

      if (!user) {
        throw new Error('INVALID_CREDENTIALS')
      }

      currentUser.value = user
      setStoredAuthUser(user)
      return user
    } catch (err) {
      error.value =
        err.message === 'INVALID_CREDENTIALS'
          ? '아이디 또는 비밀번호가 올바르지 않습니다.'
          : '로그인 중 문제가 발생했습니다. json-server 상태를 확인해 주세요.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    error.value = ''
    clearStoredAuthUser()
  }

  return {
    currentUser,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
  }
})
