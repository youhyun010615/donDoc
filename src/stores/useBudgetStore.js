import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

const API_BASE = 'http://localhost:3000';

export const useBudgetStore = defineStore('budget', () => {
  // --- State ---
  const profile = ref(null);
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
    if (!profile.value) return 0;
    const monthlyBudget =
      (profile.value.monthlyIncome * profile.value.targetExpenseRatio) / 100;
    return Math.round(monthlyBudget / 30);
  });

  const allCategories = computed(() => [
    ...incomeCategories.value,
    ...expenseCategories.value,
  ]);

  // --- Actions ---
  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_BASE}/profile`);
      profile.value = Array.isArray(res.data) ? res.data[0] : res.data;
    } catch (e) {
      error.value = '프로필 조회 실패';
      console.error(e);
    }
  }

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

  async function fetchRecords(userId = '1') {
    try {
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
        userId: '1',
        createdAt: new Date().toISOString(),
      });
      records.value = [res.data, ...records.value].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
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
      const res = await axios.put(`${API_BASE}/records/${id}`, updatedRecord);
      const idx = records.value.findIndex((r) => r.id === id);
      if (idx !== -1) records.value[idx] = res.data;
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
    } catch (e) {
      error.value = '거래 삭제 실패';
      console.error(e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function updateProfile(updates) {
    try {
      loading.value = true;
      const res = await axios.put(`${API_BASE}/profile/${profile.value.id}`, {
        ...profile.value,
        ...updates,
      });
      profile.value = res.data;
      return res.data;
    } catch (e) {
      error.value = '프로필 수정 실패';
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
        fetchProfile(),
        fetchIncomeCategories(),
        fetchExpenseCategories(),
        fetchRecords(),
      ]);
    } finally {
      loading.value = false;
    }
  }

  return {
    // state
    profile,
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
    // actions
    fetchProfile,
    fetchIncomeCategories,
    fetchExpenseCategories,
    fetchRecords,
    addRecord,
    updateRecord,
    deleteRecord,
    updateProfile,
    initStore,
  };
});
