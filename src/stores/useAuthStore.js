import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null)
  const isLoggedIn = computed(() => !!currentUser.value)

  // 로그인: userId + password로 profile 조회
  async function login(userId, password) {
    const res = await axios.get(`${API_BASE}/profile?userId=${userId}`)
    const users = Array.isArray(res.data) ? res.data : [res.data]
    const user = users.find((u) => u.userId === userId && u.password === password)
    if (!user) throw new Error('아이디 또는 비밀번호가 올바르지 않아요')
    currentUser.value = user
  }

  function logout() {
    currentUser.value = null
  }

  // 프로필(설정) 업데이트
  async function updateProfile(updates) {
    const res = await axios.put(`${API_BASE}/profile/${currentUser.value.id}`, {
      ...currentUser.value,
      ...updates,
    })
    currentUser.value = res.data
    return res.data
  }

  return { currentUser, isLoggedIn, login, logout, updateProfile }
}, {
  persist: {
    pick: ['currentUser'],
  },
})
