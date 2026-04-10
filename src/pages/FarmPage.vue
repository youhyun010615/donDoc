<script setup>
import { computed, onMounted, ref } from 'vue';
import { useBudgetStore } from '../stores/useBudgetStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import PigPixelArt from '../components/PigPixelArt.vue';
import PigBackground from '../components/PigBackground.vue';
import axios from 'axios';
import PixelIcon from '../components/PixelIcon.vue';

const store = useBudgetStore();
const authStore = useAuthStore();

const selectedFarmId = ref(null);
const isLoading = ref(true);

const farms = ref({});
const farmsMine = ref({});
const farmsNotMine = ref({});

onMounted(async () => {
  const farmsRes = await authStore.fetchAllFarms();
  farms.value = farmsRes;

  farmsMine.value = farms.value.filter((farm) =>
    authStore.currentUser.farm.includes(farm.id),
  );
  farmsNotMine.value = farms.value.filter(
    (farm) => !authStore.currentUser.farm.includes(farm.id),
  );

  isLoading.value = false;
});

const selectedFarm = computed(() => {
  if (isLoading.value) return null;

  return farms.value.find((farm) => farm.id === selectedFarmId.value) ?? null;
});

const farmMembers = ref([]);

const isMyFarm = ref(false);

async function openFarm(farmId) {
  selectedFarmId.value = farmId;

  if (farmsMine.value.find((f) => f.id === farmId)) isMyFarm.value = true;
  else isMyFarm.value = false;

  const farm = farms.value.find((f) => f.id === farmId);
  farmMembers.value = await authStore.fetchFarmMembers(farm.members);
}

function closeFarm() {
  selectedFarmId.value = null;
}

const showCreateModal = ref(false);
const newFarmName = ref('');

function openCreateModal() {
  newFarmName.value = '';
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

async function submitCreateModal() {
  showCreateModal.value = false;
  const createdFarm = await authStore.createFarm(newFarmName.value);
  await authStore.updateProfile({
    farm: [...authStore.currentUser.farm, createdFarm.id],
  });
  farms.value = await authStore.fetchAllFarms();
  farmsMine.value = farms.value.filter((farm) =>
    authStore.currentUser.farm.includes(farm.id),
  );
}

async function enterFarm() {
  await authStore.updateProfile({
    farm: [...authStore.currentUser.farm, selectedFarm.value.id],
  });
  await authStore.registerCurrentUsertoFarm(selectedFarm.value);
  selectedFarmId.value = false;

  farms.value = await authStore.fetchAllFarms();
  farmsMine.value = farms.value.filter((farm) =>
    authStore.currentUser.farm.includes(farm.id),
  );
  farmsNotMine.value = farms.value.filter(
    (farm) => !authStore.currentUser.farm.includes(farm.id),
  );
}

async function exitFarm() {
  await authStore.updateProfile({
    farm: authStore.currentUser.farm.filter(
      (id) => id !== selectedFarm.value.id,
    ),
  });
  await authStore.unregisterCurrentUserFromFarm(selectedFarm.value);
  selectedFarmId.value = false;

  farms.value = await authStore.fetchAllFarms();
  farmsMine.value = farms.value.filter((farm) =>
    authStore.currentUser.farm.includes(farm.id),
  );
  farmsNotMine.value = farms.value.filter(
    (farm) => !authStore.currentUser.farm.includes(farm.id),
  );
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

    <button v-if="!selectedFarm" @click="openCreateModal">농장 만들기</button>
    <div v-if="showCreateModal || !selectedFarm" @click.self="closeCreateModal">
      <div>
        <h3>농장 만들기</h3>
        <input
          type="text"
          v-model="newFarmName"
          placeholder="농장 이름을 입력하세요"
        />
      </div>
      <div>
        <button @click="closeCreateModal">취소</button>
        <button :disabled="!newFarmName.trim()" @click="submitCreateModal">
          만들기
        </button>
      </div>
    </div>

    <section v-if="!selectedFarm">
      <h2>내 농장</h2>
      <button
        v-for="farm in farmsMine"
        :key="farm.id"
        @click="openFarm(farm.id)"
      >
        <img src="/src/assets/farm.jpeg" alt="" width="100px" />
        {{ farm.name }}
      </button>
      <h2>모든 농장</h2>
      <button
        v-for="farm in farmsNotMine"
        :key="farm.id"
        @click="openFarm(farm.id)"
      >
        <img src="/src/assets/farm.jpeg" alt="" width="100px" />
        {{ farm.name }}
      </button>
    </section>

    <section v-else>
      <button @click="closeFarm">← 목록으로</button>
      <button @click="enterFarm" v-if="!isMyFarm">농장 가입하기</button>
      <button @click="exitFarm" v-else>농장 탈퇴하기</button>
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
