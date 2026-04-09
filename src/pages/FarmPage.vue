<script setup>
import { computed, onMounted, ref } from "vue";
import { useBudgetStore } from "../stores/useBudgetStore.js";
import { useAuthStore } from "../stores/useAuthStore.js";
import PigPixelArt from "../components/PigPixelArt.vue";
import PigBackground from "../components/PigBackground.vue";
import axios from "axios";
import PixelIcon from "../components/PixelIcon.vue";

const store = useBudgetStore();
const authStore = useAuthStore();

const selectedFarmId = ref(null);
const farms = ref({});
const isLoading = ref(true);

onMounted(async () => {
  const farmRes = await authStore.fetchCurrentUserFarms();
  farms.value = farmRes;
  isLoading.value = false;
});

const selectedFarm = computed(() => {
  if (isLoading.value) return null;

  return farms.value.find((farm) => farm.id === selectedFarmId.value) ?? null;
});

const farmMembers = ref([]);
async function openFarm(farmId) {
  selectedFarmId.value = farmId;
  const farm = farms.value.find((f) => f.id === farmId);
  farmMembers.value = await authStore.fetchFarmMembers(farm.members);
}

function closeFarm() {
  selectedFarmId.value = null;
}
</script>

<template>
  <div class="farm-page">
    <header class="page-header">
      <h1 class="page-title">
        <PixelIcon icon="nav_farm" size="1.3rem" />
        <span> 농장</span>
      </h1>
      <p class="page-subtitle">
        다른 유저 농장을 둘러보고 성장 상태를 확인해요
      </p>
    </header>

    <section v-if="!selectedFarm">
      <button v-for="farm in farms" :key="farm.id" @click="openFarm(farm.id)">
        <img src="/src/assets/farm.jpeg" alt="" width="100px" />
        {{ farm.name }}
      </button>
    </section>

    <section v-else>
      <button @click="closeFarm">← 목록으로</button>
      <h1>여기는 {{ selectedFarm.name }} 입니다!!</h1>
      <hr />
      <div v-for="farmMember in farmMembers" :key="farmMember.id">
        <PigPixelArt
          :level="farmMember.currentPigLevel"
          class="farm-pig"
          style="width: 100px"
        />
        <br />
        <h2>{{ farmMember.userName }}님의 돼지</h2>
        <hr />
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
</style>
