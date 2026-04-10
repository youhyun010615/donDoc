<script setup>
import { computed, onMounted, ref } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore.js';
import { usePigSystem } from '../composables/usePigSystem.js';
import PigPixelArt from '../components/PigPixelArt.vue';
import PigBackground from '../components/PigBackground.vue';
import PixelIcon from '../components/PixelIcon.vue';
import farmImage from '../assets/farm.jpeg';
import farmThumb1 from '../assets/farms/farm-thumb-1.svg';
import farmThumb2 from '../assets/farms/farm-thumb-2.svg';
import farmThumb3 from '../assets/farms/farm-thumb-3.svg';
import farmThumb4 from '../assets/farms/farm-thumb-4.svg';
import farmThumb5 from '../assets/farms/farm-thumb-5.svg';

const authStore = useAuthStore();
const { getHouseInfo, getPigState } = usePigSystem();
const API_BASE = 'http://localhost:3000';

const selectedFarmId = ref(null);
const farms = ref([]);
const farmMembers = ref([]);
const isLoading = ref(true);
const isMemberLoading = ref(false);
const errorMessage = ref('');
const memberPigLevelById = ref({});

const farmList = computed(() =>
  Array.isArray(farms.value) ? farms.value : [],
);

const selectedFarm = computed(
  () => farmList.value.find((farm) => farm.id === selectedFarmId.value) ?? null,
);

const FARM_THUMBS = [farmThumb1, farmThumb2, farmThumb3, farmThumb4, farmThumb5];

function getHouseIconByLevel(level) {
  const houseLevel = Number(level) || 3;
  if (houseLevel <= 1) return 'house_rock';
  if (houseLevel === 2) return 'house_hut';
  if (houseLevel === 3) return 'house_home';
  if (houseLevel === 4) return 'house_villa';
  return 'house_castle';
}

function getPigLevel(level) {
  const parsed = Number(level);
  return Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 10) : 5;
}

function resolveMemberPigLevel(member) {
  const calculatedLevel = memberPigLevelById.value[String(member.id)];
  if (Number.isFinite(calculatedLevel)) return getPigLevel(calculatedLevel);
  return getPigLevel(member.currentPigLevel);
}

function getFarmCardImage(farmId) {
  const numberPart = Number(String(farmId).replace(/\D/g, ''));
  const fallbackSeed = String(farmId)
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  const seed = Number.isFinite(numberPart) && numberPart > 0 ? numberPart : fallbackSeed;
  return FARM_THUMBS[seed % FARM_THUMBS.length];
}

async function fetchFarms() {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    const farmRes = await authStore.fetchCurrentUserFarms();
    farms.value = Array.isArray(farmRes) ? farmRes : [];
  } catch (error) {
    errorMessage.value = '농장 목록을 불러오지 못했어요.';
  } finally {
    isLoading.value = false;
  }
}

async function openFarm(farmId) {
  selectedFarmId.value = farmId;
  isMemberLoading.value = true;
  try {
    const farm = farmList.value.find((item) => item.id === farmId);
    const memberIds = Array.isArray(farm?.members)
      ? farm.members.filter(Boolean)
      : [];
    const [members, recordsRes] = await Promise.all([
      authStore.fetchFarmMembers(memberIds),
      axios.get(`${API_BASE}/records`),
    ]);

    const sortedMembers = (Array.isArray(members) ? members : []).sort((a, b) =>
      String(a.userName ?? '').localeCompare(String(b.userName ?? ''), 'ko'),
    );

    const records = Array.isArray(recordsRes.data) ? recordsRes.data : [];
    const today = new Date().toISOString().slice(0, 10);
    const nextPigLevels = {};

    sortedMembers.forEach((member) => {
      const memberId = String(member.id);
      const todayExpense = records
        .filter(
          (record) =>
            String(record.userId) === memberId &&
            record.type === 'expense' &&
            record.date === today,
        )
        .reduce((sum, record) => sum + Number(record.amount || 0), 0);

      const monthlyIncome = Number(member.monthlyIncome || 0);
      const targetExpenseRatio = Number(member.targetExpenseRatio || 0);
      const monthlyBudget = (monthlyIncome * targetExpenseRatio) / 100;
      const dailyBudget = Math.round(monthlyBudget / 30);

      nextPigLevels[memberId] = getPigState(todayExpense, dailyBudget).level;
    });

    farmMembers.value = sortedMembers;
    memberPigLevelById.value = nextPigLevels;
  } finally {
    isMemberLoading.value = false;
  }
}

function closeFarm() {
  selectedFarmId.value = null;
  farmMembers.value = [];
  memberPigLevelById.value = {};
}

onMounted(fetchFarms);
</script>

<template>
  <div class="farm-page">
    <header class="page-header">
      <h1 class="page-title">
        <PixelIcon icon="nav_farm" size="1.3rem" />
        <span>농장</span>
      </h1>
      <p class="page-subtitle">다른 유저 농장을 둘러보고 성장 상태를 확인해요</p>
    </header>

    <div class="farm-hero">
      <img :src="farmImage" alt="농장" class="farm-hero-image" />
    </div>

    <div v-if="isLoading" class="state-card">
      <PixelIcon icon="nav_farm" size="1.6rem" />
      <p>농장 목록을 불러오는 중...</p>
    </div>

    <div v-else-if="errorMessage" class="state-card error">
      <PixelIcon icon="alert" size="1.3rem" />
      <p>{{ errorMessage }}</p>
    </div>

    <section v-else-if="!selectedFarm" class="farm-list">
      <button
        v-for="farm in farmList"
        :key="farm.id"
        class="farm-card"
        type="button"
        @click="openFarm(farm.id)"
      >
        <div class="farm-illust">
          <img :src="getFarmCardImage(farm.id)" alt="" class="farm-thumb" />
        </div>
        <div class="farm-card-main">
          <p class="farm-name">{{ farm.name }}</p>
          <p class="farm-meta">
            <PixelIcon icon="pig" size="0.9rem" />
            <span>멤버 {{ farm.members?.filter(Boolean).length ?? 0 }}명</span>
          </p>
        </div>
        <span class="enter-chip">
          입장
          <PixelIcon icon="arrow_right" size="0.8rem" />
        </span>
      </button>

      <div v-if="farmList.length === 0" class="state-card">
        <PixelIcon icon="clipboard" size="1.4rem" />
        <p>참여 중인 농장이 없어요.</p>
      </div>
    </section>

    <section v-else class="farm-detail">
      <div class="detail-top">
        <button class="back-btn" type="button" @click="closeFarm">
          <PixelIcon icon="arrow_right" size="0.8rem" class="back-arrow" />
          <span>목록으로</span>
        </button>
        <div class="farm-badge">
          <PixelIcon icon="nav_farm" size="1rem" />
          <span>{{ selectedFarm.name }}</span>
        </div>
      </div>

      <div v-if="isMemberLoading" class="state-card">
        <PixelIcon icon="pig" size="1.6rem" />
        <p>농장 멤버를 불러오는 중...</p>
      </div>

      <div v-else class="member-grid">
        <article
          v-for="member in farmMembers"
          :key="member.id"
          class="member-card"
        >
          <div class="member-visual">
            <PigBackground :house-level="member.houseLevel ?? 3" :scale="1.1" />
            <PigPixelArt :level="resolveMemberPigLevel(member)" class="member-pig" />
          </div>

          <div class="member-info">
            <p class="member-name">{{ member.userName }}</p>
            <div class="member-badges">
              <span class="badge">
                <PixelIcon icon="pig" size="0.85rem" />
                <span>돼지 Lv.{{ resolveMemberPigLevel(member) }}</span>
              </span>
              <span class="badge">
                <PixelIcon :icon="getHouseIconByLevel(member.houseLevel)" size="0.85rem" />
                <span>{{ getHouseInfo(member.houseLevel ?? 3).name }}</span>
              </span>
            </div>
          </div>
        </article>

        <div v-if="farmMembers.length === 0" class="state-card">
          <PixelIcon icon="clipboard" size="1.4rem" />
          <p>아직 등록된 농장 멤버가 없어요.</p>
        </div>
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
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.page-subtitle {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.82rem;
}

.farm-list,
.farm-detail {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.farm-hero {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

.farm-hero-image {
  display: block;
  width: 100%;
  height: 130px;
  object-fit: cover;
}

.state-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  padding: 1.15rem 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
}

.state-card.error {
  border-color: #ffd5d5;
  background: #fff7f7;
  color: #dc5b5b;
}

.farm-card {
  width: 100%;
  border: 1.5px solid var(--border);
  background: linear-gradient(145deg, #ffffff 0%, #fff8ea 100%);
  border-radius: 18px;
  padding: 0.8rem 0.9rem;
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  text-align: left;
  transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;
}

.farm-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 14px rgba(255, 179, 71, 0.15);
  border-color: #ffd7a5;
}

.farm-illust {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  border: 1px solid #ffe0bb;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.farm-thumb {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.farm-card-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.farm-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.farm-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.enter-chip {
  border: 1px solid #ffd6e5;
  background: #fff4f9;
  color: var(--primary);
  border-radius: 999px;
  padding: 0.22rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.65rem;
}

.back-btn {
  border: 1.5px solid var(--border);
  background: #fff;
  border-radius: 10px;
  height: 32px;
  padding: 0 0.65rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text);
}

.back-arrow {
  transform: rotate(180deg);
}

.farm-badge {
  border: 1.5px solid #ffd7a5;
  background: #fff3df;
  border-radius: 10px;
  padding: 0.38rem 0.65rem;
  font-size: 0.78rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: #b96915;
}

.member-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.member-card {
  background: #fff;
  border: 1.5px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
}

.member-visual {
  position: relative;
  height: 152px;
  background: #fff8ed;
}

.member-visual :deep(.pig-background) {
  position: absolute;
  inset: 0;
}

.member-pig {
  position: absolute;
  left: 50%;
  bottom: 12px;
  width: 62px;
  transform: translateX(-50%) translateY(0);
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.16));
  animation: farmPigFloat 3s ease-in-out infinite;
}

.member-card:nth-child(2n) .member-pig {
  animation-delay: 0.35s;
}

.member-card:nth-child(3n) .member-pig {
  animation-delay: 0.7s;
}

@keyframes farmPigFloat {
  0%,
  100% {
    transform: translateX(-50%) translateY(0) scale(1);
  }
  50% {
    transform: translateX(-50%) translateY(-8px) scale(1.03);
  }
}

.member-info {
  padding: 0.8rem 0.85rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.48rem;
}

.member-name {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text);
}

.member-badges {
  display: flex;
  align-items: center;
  gap: 0.38rem;
  flex-wrap: wrap;
}

.badge {
  border-radius: 999px;
  border: 1px solid var(--border);
  background: var(--bg-main);
  color: var(--text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.44rem;
  display: inline-flex;
  align-items: center;
  gap: 0.23rem;
}

@media (min-width: 430px) {
  .member-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
