import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AccountPage from '../pages/AccountPage.vue'
import StatisticsPage from '../pages/StatisticsPage.vue'
import SettingPage from '../pages/SettingPage.vue'
import LoginPage from '../pages/LoginPage.vue'
import { getStoredAuthUser } from '../utils/auth.js'

const routes = [
  { path: '/login', name: 'Login', component: LoginPage, meta: { public: true, hideNav: true } },
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
  const currentUser = getStoredAuthUser()

  if (!to.meta.public && !currentUser) {
    return { name: 'Login' }
  }

  if (to.name === 'Login' && currentUser) {
    return { name: 'Home' }
  }

  return true
})

export default router
