import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';
import { usePigSystem } from '../composables/usePigSystem.js';
import { useAuthStore } from './useAuthStore.js';

const API_BASE = import.meta.env.VITE_API_BASE;
const INITIAL_HOUSE_LEVEL = 3;

export const useBudgetStore = defineStore('budget', () => {
  const { calcNextHouseLevel, getPigState } = usePigSystem();
  const authStore = useAuthStore();
  let profileSettleChain = Promise.resolve();

  // --- State ---
  const records = ref([]);
  const incomeCategories = ref([]);
  const expenseCategories = ref([]);
  const currentMonth = ref(new Date().toISOString().slice(0, 7)); // 'YYYY-MM'
  const loading = ref(false);
  const error = ref(null);

  // --- Getters ---
  const monthlyRecords = computed(() =>
    records.value.filter((r) => r.date.startsWith(currentMonth.value)),
  );

  const todayRecords = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return records.value.filter((r) => r.date === today);
  });

  const totalExpenseThisMonth = computed(() =>
    monthlyRecords.value
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0),
  );

  const totalIncomeThisMonth = computed(() =>
    monthlyRecords.value
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0),
  );

  const todayExpense = computed(() =>
    todayRecords.value
      .filter((r) => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0),
  );

  const todayIncome = computed(() =>
    todayRecords.value
      .filter((r) => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0),
  );

  const monthlyNetIncome = computed(
    () => totalIncomeThisMonth.value - totalExpenseThisMonth.value,
  );

  const todayNetIncome = computed(() => todayIncome.value - todayExpense.value);

  const dailyBudget = computed(() => {
    if (!authStore.currentUser) return 0;
    const monthlyBudget =
      (authStore.currentUser.monthlyIncome * authStore.currentUser.targetExpenseRatio) / 100;
    return Math.round(monthlyBudget / 30);
  });

  const allCategories = computed(() => [
    ...incomeCategories.value,
    ...expenseCategories.value,
  ]);

  function getPreviousMonth(yyyymm) {
    const [year, month] = yyyymm.split('-').map(Number);
    const prev = new Date(year, month - 2, 1);
    const y = prev.getFullYear();
    const m = String(prev.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function getMonthExpense(yyyymm) {
    return records.value
      .filter((r) => r.type === 'expense' && r.date.startsWith(yyyymm))
      .reduce((sum, r) => sum + r.amount, 0);
  }

  function hasExpenseRecords(yyyymm) {
    return records.value.some(
      (r) => r.type === 'expense' && r.date.startsWith(yyyymm),
    );
  }

  function getNextMonth(yyyymm) {
    const [year, month] = yyyymm.split('-').map(Number);
    const next = new Date(year, month, 1);
    const y = next.getFullYear();
    const m = String(next.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }

  function getFirstActiveMonth() {
    const months = records.value
      .filter((r) => r.type === 'income' || r.type === 'expense')
      .map((r) => String(r.date).slice(0, 7))
      .filter((m) => /^\d{4}-\d{2}$/.test(m))
      .sort();
    return months[0] ?? null;
  }

  function calculateHouseLevelFromRecords() {
    if (!authStore.currentUser) return INITIAL_HOUSE_LEVEL;

    const monthlyBudget =
      (authStore.currentUser.monthlyIncome * authStore.currentUser.targetExpenseRatio) / 100;
    if (monthlyBudget <= 0) return INITIAL_HOUSE_LEVEL;

    const firstActiveMonth = getFirstActiveMonth();
    if (!firstActiveMonth) return INITIAL_HOUSE_LEVEL;

    let level = INITIAL_HOUSE_LEVEL;
    let settlementMonth = getNextMonth(firstActiveMonth);
    const endMonth = currentMonth.value;

    while (settlementMonth <= endMonth) {
      const prevMonth = getPreviousMonth(settlementMonth);
      if (hasExpenseRecords(prevMonth)) {
        const prevMonthExpense = getMonthExpense(prevMonth);
        const prevAvgRatio = Math.round((prevMonthExpense / monthlyBudget) * 100);
        level = calcNextHouseLevel(prevAvgRatio, level);
      }
      settlementMonth = getNextMonth(settlementMonth);
    }

    return level;
  }

  function calculateCurrentPigLevel() {
    if (!authStore.currentUser || dailyBudget.value <= 0) {
      return authStore.currentUser?.currentPigLevel ?? 5;
    }

    return getPigState(todayExpense.value, dailyBudget.value).level;
  }

  async function settleProfileState() {
    if (!authStore.currentUser) return;

    const calculatedHouseLevel = calculateHouseLevelFromRecords();
    const calculatedPigLevel = calculateCurrentPigLevel();
    const currentHouseLevel = authStore.currentUser.houseLevel ?? INITIAL_HOUSE_LEVEL;
    const currentPigLevel = authStore.currentUser.currentPigLevel ?? 5;

    const updates = {};
    if (currentHouseLevel !== calculatedHouseLevel) {
      updates.houseLevel = calculatedHouseLevel;
    }
    if (currentPigLevel !== calculatedPigLevel) {
      updates.currentPigLevel = calculatedPigLevel;
    }

    if (Object.keys(updates).length === 0) return;

    try {
      await authStore.updateProfile(updates);
    } catch (e) {
      console.error('프로필 상태 정산 실패', e);
    }
  }

  function scheduleProfileSettlement() {
    profileSettleChain = profileSettleChain
      .then(() => settleProfileState())
      .catch((e) => {
        console.error('프로필 상태 백그라운드 정산 실패', e);
      });
    return profileSettleChain;
  }

  // --- Actions ---
  async function fetchIncomeCategories() {
    try {
      const res = await axios.get(`${API_BASE}/incomeCategories`);
      incomeCategories.value = res.data;
    } catch (e) {
      error.value = '수입 카테고리 조회 실패';
      console.error(e);
    }
  }

  async function fetchExpenseCategories() {
    try {
      const res = await axios.get(`${API_BASE}/expenseCategories`);
      expenseCategories.value = res.data;
    } catch (e) {
      error.value = '지출 카테고리 조회 실패';
      console.error(e);
    }
  }

  async function fetchRecords() {
    try {
      const userId = authStore.currentUser?.id;
      const res = await axios.get(`${API_BASE}/records?userId=${userId}`);
      records.value = res.data.sort((a, b) => b.date.localeCompare(a.date));
    } catch (e) {
      error.value = '거래 내역 조회 실패';
      console.error(e);
    }
  }

  async function addRecord(newRecord) {
    try {
      loading.value = true;
      const res = await axios.post(`${API_BASE}/records`, {
        ...newRecord,
        userId: authStore.currentUser?.id,
        createdAt: new Date().toISOString(),
      });
      records.value = [res.data, ...records.value].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      void scheduleProfileSettlement();
      return res.data;
    } catch (e) {
      error.value = '거래 추가 실패';
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateRecord(id, updatedRecord) {
    try {
      loading.value = true;
      const res = await axios.patch(`${API_BASE}/records/${id}`, updatedRecord);
      records.value = records.value
        .map((record) => (record.id === id ? res.data : record))
        .sort((a, b) => b.date.localeCompare(a.date));
      void scheduleProfileSettlement();
      return res.data;
    } catch (e) {
      error.value = '거래 수정 실패';
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRecord(id) {
    try {
      loading.value = true;
      await axios.delete(`${API_BASE}/records/${id}`);
      records.value = records.value.filter((r) => r.id !== id);
      void scheduleProfileSettlement();
    } catch (e) {
      error.value = '거래 삭제 실패';
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function initStore() {
    loading.value = true;
    error.value = null;
    try {
      await Promise.all([
        fetchIncomeCategories(),
        fetchExpenseCategories(),
        fetchRecords(),
      ]);
      void scheduleProfileSettlement();
    } finally {
      loading.value = false;
    }
  }

  function resetStore() {
    records.value = [];
    incomeCategories.value = [];
    expenseCategories.value = [];
    error.value = null;
  }

  return {
    // state
    records,
    incomeCategories,
    expenseCategories,
    currentMonth,
    loading,
    error,
    // getters
    monthlyRecords,
    todayRecords,
    totalExpenseThisMonth,
    totalIncomeThisMonth,
    todayExpense,
    todayIncome,
    monthlyNetIncome,
    todayNetIncome,
    dailyBudget,
    allCategories,
    settleProfileState,
    // actions
    fetchIncomeCategories,
    fetchExpenseCategories,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    initStore,
    resetStore,
  };
});
