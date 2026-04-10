<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NavBar from './components/NavBar.vue';
import { useAuthStore } from './stores/useAuthStore.js';
import { useBudgetStore } from './stores/useBudgetStore.js';

const route = useRoute();
const authStore = useAuthStore();
const budgetStore = useBudgetStore();

const hideNavRoutes = ['Login', 'Guide', 'Setup'];

onMounted(async () => {
  if (authStore.isLoggedIn) {
    await budgetStore.initStore();
  }
});
</script>

<template>
  <div id="app-wrapper">
    <NavBar
      v-if="authStore.isLoggedIn && !hideNavRoutes.includes(route.name)"
    />
    <main class="main-content" :class="{ 'no-nav': !authStore.isLoggedIn }">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
#app-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-main);
}

.main-content {
  flex: 1;
  padding: 1.5rem 1rem 5rem;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.main-content.no-nav {
  padding: 0;
  max-width: 100%;
}
</style>
