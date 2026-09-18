import { createRouter, createWebHistory } from 'vue-router'
import EmptyView from '@/views/EmptyView.vue'
import TrackerView from '@/views/TrackerView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'default',
      component: EmptyView,
    },
    {
      path: '/tracker',
      name: 'tracker',
      component: TrackerView,
    },
  ],
})

export default router
