import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/useAuthStore.js'
import HomePage from '../pages/HomePage.vue'
import AccountPage from '../pages/AccountPage.vue'
import StatisticsPage from '../pages/StatisticsPage.vue'
import SettingPage from '../pages/SettingPage.vue'
import LoginPage from '../pages/LoginPage.vue'

const routes = [
  { path: '/login', name: 'Login', component: LoginPage, meta: { public: true } },
  { path: '/', name: 'Home', component: HomePage },
  { path: '/account', name: 'Account', component: AccountPage },
  { path: '/statistics', name: 'Statistics', component: StatisticsPage },
  { path: '/settings', name: 'Settings', component: SettingPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (!to.meta.public && !authStore.isLoggedIn) {
    return { name: 'Login' }
  }
  if (to.name === 'Login' && authStore.isLoggedIn) {
    return { name: 'Home' }
  }
})

export default router
