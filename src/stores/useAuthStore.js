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

  // 회원가입
  async function signup(userData) {
    // 1. 아이디 중복 확인
    const checkRes = await axios.get(`${API_BASE}/profile?userId=${userData.userId}`)
    const existingUsers = Array.isArray(checkRes.data) ? checkRes.data : [checkRes.data]
    if (existingUsers.length > 0 && existingUsers[0].userId === userData.userId) {
      throw new Error('이미 사용 중인 아이디예요')
    }

    // 2. 새 프로필 생성
    const newUser = {
      ...userData,
      currentPigLevel: 1,
      houseLevel: 1,
      createdAt: new Date().toISOString().split('T')[0]
    }

    await axios.post(`${API_BASE}/profile`, newUser)
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

  return { currentUser, isLoggedIn, login, signup, logout, updateProfile }
}, {
  persist: {
    pick: ['currentUser'],
  },
})
