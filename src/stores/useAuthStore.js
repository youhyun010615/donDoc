import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../lib/api.js';
import {
  fetchFarmIdsByUser,
  fetchFarmMemberCounts,
  fetchUserIdsByFarm,
  joinFarmIn,
  leaveFarmIn,
} from '../services/farmInService.js';

const API_BASE = import.meta.env.VITE_API_BASE;
const DEFAULT_FARM_ID = '1';
const DEFAULT_FARM_NAME = 'kb농장';

export const useAuthStore = defineStore(
  'auth',
  () => {
    const currentUser = ref(null);
    const isLoggedIn = computed(() => !!currentUser.value);
    let farmMutationChain = Promise.resolve();

    async function ensureDefaultFarm() {
      const res = await api.get(`${API_BASE}/farm?id=${DEFAULT_FARM_ID}`);
      const existing = Array.isArray(res.data) ? res.data[0] : null;
      if (existing) return existing;

      const created = await api.post(`${API_BASE}/farm`, {
        id: DEFAULT_FARM_ID,
        name: DEFAULT_FARM_NAME,
      });
      return created.data;
    }

    async function cleanupEmptyFarms() {
      const [farmRes, counts] = await Promise.all([
        api.get(`${API_BASE}/farm`),
        fetchFarmMemberCounts(),
      ]);
      const farms = Array.isArray(farmRes.data) ? farmRes.data : [];
      const deleteTargets = farms.filter((farm) => {
        const farmId = String(farm.id);
        if (farmId === DEFAULT_FARM_ID) return false;
        return (counts?.[farmId] ?? 0) <= 0;
      });

      await Promise.all(
        deleteTargets.map((farm) => api.delete(`${API_BASE}/farm/${farm.id}`)),
      );
    }

    // 로그인: userId + password로 profile 조회
    async function login(userId, password) {
      const res = await api.get(`${API_BASE}/profile?userId=${userId}`);
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
      const checkRes = await api.get(
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

      await ensureDefaultFarm();
      const userRes = await api.post(`${API_BASE}/profile`, newUser);
      await joinFarmIn(DEFAULT_FARM_ID, userRes.data.id);
    }

    function logout() {
      currentUser.value = null;
    }

    // 프로필(설정) 업데이트
    async function updateProfile(updates) {
      if (!currentUser.value) throw new Error('로그인 정보가 없어요');
      try {
        const res = await api.patch(
          `${API_BASE}/profile/${currentUser.value.id}`,
          updates,
        );
        const next = res.data;
        currentUser.value = next;
        return next;
      } catch (error) {
        const status = error?.response?.status;
        if (status !== 404 || !currentUser.value?.userId) throw error;

        // Persisted currentUser.id가 서버와 어긋난 경우 userId로 다시 찾아 재시도
        const lookupRes = await api.get(
          `${API_BASE}/profile?userId=${currentUser.value.userId}`,
        );
        const matched = Array.isArray(lookupRes.data) ? lookupRes.data[0] : null;
        if (!matched?.id) throw error;

        currentUser.value = matched;
        const retryRes = await api.patch(
          `${API_BASE}/profile/${matched.id}`,
          updates,
        );
        const retry = retryRes.data;
        currentUser.value = retry;
        return retry;
      }
    }

    async function fetchAllFarms() {
      await ensureDefaultFarm();
      await cleanupEmptyFarms();
      const farmRes = await api.get(`${API_BASE}/farm`);
      return farmRes.data;
    }

    async function fetchCurrentUserFarms() {
      if (!currentUser.value) return [];
      const [farmRes, myFarmIds] = await Promise.all([
        api.get(`${API_BASE}/farm`),
        fetchFarmIdsByUser(currentUser.value.id),
      ]);
      const farms = Array.isArray(farmRes.data) ? farmRes.data : [];
      const mySet = new Set(myFarmIds.map(String));
      return farms.filter((farm) => mySet.has(String(farm.id)));
    }

    async function createFarm(name) {
      const trimmedName = String(name ?? '').trim();
      if (!trimmedName) throw new Error('농장 이름을 입력해주세요');

      const farms = await fetchAllFarms();
      const duplicated = farms.some(
        (farm) =>
          String(farm.name ?? '').trim().toLowerCase() ===
          trimmedName.toLowerCase(),
      );
      if (duplicated) throw new Error('이미 존재하는 농장 이름이에요');

      const farm = {
        name: trimmedName,
      };
      const res = await api.post(`${API_BASE}/farm`, farm);
      return res.data;
    }

    async function fetchFarmMembersByFarmId(farmId) {
      const targetFarmId = String(farmId);
      const [profilesRes, memberIds] = await Promise.all([
        api.get(`${API_BASE}/profile`),
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
        await cleanupEmptyFarms();
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
