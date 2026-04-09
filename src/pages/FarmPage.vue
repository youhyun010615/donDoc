<script setup>
import { computed, ref } from 'vue';
import PigPixelArt from '../components/PigPixelArt.vue';
import PigBackground from '../components/PigBackground.vue';
import { useBudgetStore } from '../stores/useBudgetStore.js';
import { usePigSystem } from '../composables/usePigSystem.js';

const store = useBudgetStore();
const { getPigState } = usePigSystem();

const selectedFarmId = ref(null);

const myPigState = computed(() =>
  getPigState(store.todayExpense, store.dailyBudget),
);

const myFarm = computed(() => ({
  id: 'my-farm',
  name: `${store.profile?.userName ?? '나'}의 농장`,
  owner: store.profile?.userName ?? '나',
  pigLevel: myPigState.value.level ?? 5,
  houseLevel: store.profile?.houseLevel ?? 3,
  description: '오늘 소비 상태를 반영한 내 농장',
}));

const neighborFarms = ref([
  {
    id: 'farm-01',
    name: '절약왕 민지네 농장',
    owner: '민지',
    pigLevel: 9,
    houseLevel: 5,
    description: '지출 통제가 안정적인 모범 농장',
  },
  {
    id: 'farm-02',
    name: '알뜰러 태현 농장',
    owner: '태현',
    pigLevel: 7,
    houseLevel: 4,
    description: '예산 준수율이 좋은 성장형 농장',
  },
  {
    id: 'farm-03',
    name: '도전중 수아 농장',
    owner: '수아',
    pigLevel: 4,
    houseLevel: 2,
    description: '지출 관리 습관을 만드는 중',
  },
]);

const farms = computed(() => [myFarm.value, ...neighborFarms.value]);

const selectedFarm = computed(
  () => farms.value.find((farm) => farm.id === selectedFarmId.value) ?? null,
);

function openFarm(farmId) {
  selectedFarmId.value = farmId;
}

function closeFarm() {
  selectedFarmId.value = null;
}
</script>

<template>
  <div class="farm-page">
    <header class="page-header">
      <h1 class="page-title">🌾 농장</h1>
      <p class="page-subtitle">
        다른 유저 농장을 둘러보고 성장 상태를 확인해요
      </p>
    </header>

    <section v-if="!selectedFarm" class="farm-list">
      <button
        v-for="farm in farms"
        :key="farm.id"
        class="farm-card"
        @click="openFarm(farm.id)"
      >
        <div class="farm-card-top">
          <strong class="farm-name">{{ farm.name }}</strong>
          <span class="farm-owner">{{ farm.owner }}</span>
        </div>
        <p class="farm-desc">{{ farm.description }}</p>
        <div class="farm-stats">
          <span>🐷 Lv.{{ farm.pigLevel }}</span>
          <span>🏠 Lv.{{ farm.houseLevel }}</span>
        </div>
      </button>
    </section>

    <section v-else class="farm-detail">
      <button class="btn-back" @click="closeFarm">← 목록으로</button>
      <h2 class="detail-title">{{ selectedFarm.name }}</h2>
      <p class="detail-subtitle">{{ selectedFarm.description }}</p>

      <div class="farm-scene">
        <PigBackground
          :house-level="selectedFarm.houseLevel"
          :scale="0.58"
          class="farm-bg"
        />
        <PigPixelArt :level="selectedFarm.pigLevel" class="farm-pig" />
      </div>

      <div class="detail-stats">
        <span>🐷 돼지 레벨: {{ selectedFarm.pigLevel }}</span>
        <span>🏠 집 레벨: {{ selectedFarm.houseLevel }}</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.farm-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 800;
}

.page-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.farm-list {
  display: grid;
  gap: 0.7rem;
}

.farm-card {
  border: 1.5px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 0.85rem;
  text-align: left;
  cursor: pointer;
}

.farm-card-top {
  display: flex;
  justify-content: space-between;
  gap: 0.6rem;
}

.farm-name {
  font-size: 0.95rem;
  color: var(--text);
}

.farm-owner {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.farm-desc {
  margin: 0.45rem 0;
  color: var(--text-muted);
  font-size: 0.78rem;
}

.farm-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 700;
}

.farm-detail {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.btn-back {
  align-self: flex-start;
  border: none;
  background: #f4f6fb;
  color: var(--text);
  border-radius: 10px;
  padding: 0.35rem 0.6rem;
  font-size: 0.78rem;
  cursor: pointer;
}

.detail-title {
  margin: 0;
  font-size: 1rem;
}

.detail-subtitle {
  margin: 0;
  font-size: 0.78rem;
  color: var(--text-muted);
}

.farm-scene {
  position: relative;
  width: 100%;
  min-height: 170px;
  border-radius: 14px;
  overflow: hidden;
  background: #f9fbff;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.farm-bg {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.farm-pig {
  position: relative;
  z-index: 2;
  width: 88px;
  height: auto;
  transform-origin: center bottom;
}

.detail-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.82rem;
  font-weight: 700;
}
</style>
