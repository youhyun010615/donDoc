<script setup>
import { onMounted } from 'vue'
import NavBar from './components/NavBar.vue'
import { useBudgetStore } from './stores/useBudgetStore.js'

const store = useBudgetStore()

onMounted(async () => {
  await store.initStore()
})
</script>

<template>
  <div id="app-wrapper">
    <NavBar />
    <main class="main-content">
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
</style>
