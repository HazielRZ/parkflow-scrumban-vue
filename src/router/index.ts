import { createRouter, createWebHistory } from 'vue-router'
import ScrumbanBoard from '@/components/ScrumbanBoard.vue'
import ErsTraceabilityView from '@/components/ErsTraceabilityView.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'scrumban-board',
      component: ScrumbanBoard
    },
    {
      path: '/guest',
      name: 'guest-evaluator-board',
      component: ScrumbanBoard,
      beforeEnter: () => {
        const authStore = useAuthStore()
        authStore.enterGuestEvaluatorMode()
      }
    },
    {
      path: '/traceability',
      name: 'ers-traceability',
      component: ErsTraceabilityView
    }
  ]
})

export default router
