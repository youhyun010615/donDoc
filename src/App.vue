<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'
import { useBudgetStore } from './stores/useBudgetStore.js'
import { useAuthStore } from './stores/useAuthStore.js'

const route = useRoute()
const store = useBudgetStore()
const authStore = useAuthStore()

const showNavBar = computed(() =>
  authStore.isAuthenticated && route.meta.hideNav !== true
)

watch(
  () => authStore.currentUser?.id,
  async (userId) => {
    if (!userId) {
      store.resetStore()
      return
    }

    await store.initStore(userId)
  },
  { immediate: true }
)
</script>

<template>
  <div id="app-wrapper" :class="{ 'login-layout': !showNavBar }">
    <NavBar v-if="showNavBar" />
    <main class="main-content" :class="{ compact: !showNavBar }">
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

#app-wrapper.login-layout {
  justify-content: center;
}

.main-content {
  flex: 1;
  padding: 1.5rem 1rem 5rem;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
}

.main-content.compact {
  padding-bottom: 1.5rem;
}
</style>
