import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import AccountPage from '../pages/AccountPage.vue'
import StatisticsPage from '../pages/StatisticsPage.vue'
import SettingPage from '../pages/SettingPage.vue'

const routes = [
  { path: '/', name: 'Home', component: HomePage },
  { path: '/account', name: 'Account', component: AccountPage },
  { path: '/statistics', name: 'Statistics', component: StatisticsPage },
  { path: '/settings', name: 'Settings', component: SettingPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
