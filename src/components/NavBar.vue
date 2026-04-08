<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
</script>

<template>
  <nav class="navbar">
    <RouterLink to="/" class="nav-item" :class="{ active: route.path === '/' }">
      <span class="nav-icon">🏠</span>
      <span class="nav-label">홈</span>
    </RouterLink>
    <RouterLink
      to="/account"
      class="nav-item"
      :class="{ active: route.path === '/account' }"
    >
      <span class="nav-icon">📒</span>
      <span class="nav-label">가계부</span>
    </RouterLink>
    <RouterLink
      to="/statistics"
      class="nav-item"
      :class="{ active: route.path === '/statistics' }"
    >
      <span class="nav-icon">📊</span>
      <span class="nav-label">통계</span>
    </RouterLink>
    <RouterLink
      to="/settings"
      class="nav-item"
      :class="{ active: route.path === '/settings' }"
    >
      <span class="nav-icon">⚙️</span>
      <span class="nav-label">설정</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  width: 100%;
  margin: 0 auto;
  background: #fff;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
  z-index: 100;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-decoration: none;
  color: var(--text-muted);
  padding: 0.3rem 1rem;
  border-radius: 12px;
  transition: all 0.2s;
  flex: 1;
}

.nav-item.active {
  color: var(--primary);
}

.nav-item.active .nav-icon {
  transform: scale(1.2);
}

.nav-icon {
  font-size: 1.4rem;
  transition: transform 0.2s;
  line-height: 1;
}

.nav-label {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: -0.3px;
}
</style>
