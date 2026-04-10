import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const currentUser = ref(null);
    const isLoggedIn = computed(() => !!currentUser.value);

    // 로그인: userId + password로 profile 조회
    async function login(userId, password) {
      const res = await axios.get(`${API_BASE}/profile?userId=${userId}`);
      const users = Array.isArray(res.data) ? res.data : [res.data];
      const user = users.find(
        (u) => u.userId === userId && u.password === password,
      );
      if (!user) throw new Error('아이디 또는 비밀번호가 올바르지 않아요');
      currentUser.value = user;
    }

    // 회원가입
    async function signup(userData) {
      // 1. 아이디 중복 확인
      const checkRes = await axios.get(
        `${API_BASE}/profile?userId=${userData.userId}`,
      );
      const existingUsers = Array.isArray(checkRes.data)
        ? checkRes.data
        : [checkRes.data];
      if (
        existingUsers.length > 0 &&
        existingUsers[0].userId === userData.userId
      ) {
        throw new Error('이미 사용 중인 아이디예요');
      }

      // 2. 새 프로필 생성
      const newUser = {
        ...userData,
        currentPigLevel: 5,
        houseLevel: 3,
        createdAt: new Date().toISOString().split('T')[0],
        farm: ['1'],
      };

      const userRes = await axios.post(`${API_BASE}/profile`, newUser);
      const farmRes = await axios.get(`${API_BASE}/farm?id=1`);
      const farm = farmRes.data[0];
      const updatedFarm = {
        ...farm,
        members: [...farm.members, userRes.data.id],
      };
      await axios.put(`${API_BASE}/farm/1`, updatedFarm);
    }

    function logout() {
      currentUser.value = null;
    }

    // 프로필(설정) 업데이트
    async function updateProfile(updates) {
      const res = await axios.put(
        `${API_BASE}/profile/${currentUser.value.id}`,
        {
          ...currentUser.value,
          ...updates,
        },
      );
      currentUser.value = res.data;
      return res.data;
    }

    async function fetchAllFarms() {
      const farmRes = await axios.get(`${API_BASE}/farm`);
      return farmRes.data;
    }

    async function fetchCurrentUserFarms() {
      const farmRes = await axios.get(`${API_BASE}/farm`);
      const farms = farmRes.data;

      return farms.filter((farm) => currentUser.value.farm.includes(farm.id));
    }

    async function fetchFarmMembers(membersId) {
      const res = await axios.get(`${API_BASE}/profile`);
      return res.data.filter((user) => membersId.includes(user.id));
    }

    async function createFarm(name) {
      const farm = {
        name: name,
        members: [currentUser.value.id],
      };
      const res = await axios.post(`${API_BASE}/farm`, farm);
      return res.data;
    }

    async function registerCurrentUsertoFarm(farm) {
      console.log(farm.members.includes(currentUser.value.id));
      const updatedFarm = {
        ...farm,
        members: farm.members.includes(currentUser.value.id)
          ? farm.members
          : [...farm.members, currentUser.value.id],
      };
      await axios.put(`${API_BASE}/farm/${farm.id}`, updatedFarm);
    }

    async function unregisterCurrentUserFromFarm(farm) {
      const updatedFarm = {
        ...farm,
        members: farm.members.filter((id) => id !== currentUser.value.id),
      };
      await axios.put(`${API_BASE}/farm/${farm.id}`, updatedFarm);
    }

    return {
      currentUser,
      isLoggedIn,
      login,
      signup,
      logout,
      updateProfile,
      fetchCurrentUserFarms,
      fetchFarmMembers,
      fetchAllFarms,
      createFarm,
      registerCurrentUsertoFarm,
      unregisterCurrentUserFromFarm,
    };
  },
  {
    persist: {
      pick: ['currentUser'],
    },
  },
);
