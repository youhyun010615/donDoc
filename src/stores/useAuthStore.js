import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import {
  fetchFarmIdsByUser,
  fetchFarmMemberCounts,
  fetchUserIdsByFarm,
  joinFarmIn,
  leaveFarmIn,
} from '../services/farmInService.js';

const API_BASE = import.meta.env.VITE_API_BASE;

export const useAuthStore = defineStore(
  'auth',
  () => {
    const currentUser = ref(null);
    const isLoggedIn = computed(() => !!currentUser.value);
    let farmMutationChain = Promise.resolve();

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

      await axios.post(`${API_BASE}/profile`, newUser);
    }

    function logout() {
      currentUser.value = null;
    }

    async function replaceProfileById(profileId, mergedFields) {
      const baseRes = await axios.get(`${API_BASE}/profile/${profileId}`);
      const base = baseRes.data ?? {};
      const next = {
        ...base,
        ...mergedFields,
        id: base.id ?? profileId,
      };
      await axios.delete(`${API_BASE}/profile/${profileId}`);
      const createdRes = await axios.post(`${API_BASE}/profile`, next);
      return createdRes.data;
    }

    // 프로필(설정) 업데이트
    async function updateProfile(updates) {
      if (!currentUser.value) throw new Error('로그인 정보가 없어요');
      try {
        const next = await replaceProfileById(currentUser.value.id, updates);
        currentUser.value = next;
        return next;
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 404 || !currentUser.value?.userId) throw error;

        // Persisted currentUser.id가 서버와 어긋난 경우 userId로 다시 찾아 재시도
        const lookupRes = await axios.get(
          `${API_BASE}/profile?userId=${currentUser.value.userId}`,
        );
        const matched = Array.isArray(lookupRes.data) ? lookupRes.data[0] : null;
        if (!matched?.id) throw error;

        currentUser.value = matched;
        const retry = await replaceProfileById(matched.id, updates);
        currentUser.value = retry;
        return retry;
      }
    }

    async function fetchAllFarms() {
      const farmRes = await axios.get(`${API_BASE}/farm`);
      return farmRes.data;
    }

    async function fetchCurrentUserFarms() {
      if (!currentUser.value) return [];
      const [farmRes, myFarmIds] = await Promise.all([
        axios.get(`${API_BASE}/farm`),
        fetchFarmIdsByUser(currentUser.value.id),
      ]);
      const farms = Array.isArray(farmRes.data) ? farmRes.data : [];
      const mySet = new Set(myFarmIds.map(String));
      return farms.filter((farm) => mySet.has(String(farm.id)));
    }

    async function createFarm(name) {
      const farm = {
        name: name,
      };
      const res = await axios.post(`${API_BASE}/farm`, farm);
      return res.data;
    }

    async function fetchFarmMembersByFarmId(farmId) {
      const targetFarmId = String(farmId);
      const [profilesRes, memberIds] = await Promise.all([
        axios.get(`${API_BASE}/profile`),
        fetchUserIdsByFarm(targetFarmId),
      ]);
      const users = Array.isArray(profilesRes.data) ? profilesRes.data : [];
      const memberIdSet = new Set(memberIds.map(String));
      return users.filter((user) => memberIdSet.has(String(user.id)));
    }

    async function joinFarm(farmId) {
      return enqueueFarmMutation(async () => {
        if (!currentUser.value) return null;
        const targetFarmId = String(farmId);
        await joinFarmIn(targetFarmId, currentUser.value.id);
        return currentUser.value;
      });
    }

    async function leaveFarm(farmId) {
      return enqueueFarmMutation(async () => {
        if (!currentUser.value) return null;
        const targetFarmId = String(farmId);
        await leaveFarmIn(targetFarmId, currentUser.value.id);
        return currentUser.value;
      });
    }

    async function fetchCurrentUserFarmIds() {
      if (!currentUser.value) return [];
      return fetchFarmIdsByUser(currentUser.value.id);
    }

    async function fetchFarmCounts() {
      return fetchFarmMemberCounts();
    }

    function enqueueFarmMutation(task) {
      const run = farmMutationChain.then(task, task);
      farmMutationChain = run.catch(() => {});
      return run;
    }

    return {
      currentUser,
      isLoggedIn,
      login,
      signup,
      logout,
      updateProfile,
      fetchCurrentUserFarms,
      fetchFarmMembersByFarmId,
      fetchAllFarms,
      createFarm,
      joinFarm,
      leaveFarm,
      fetchCurrentUserFarmIds,
      fetchFarmCounts,
    };
  },
  {
    persist: {
      pick: ['currentUser'],
    },
  },
);
