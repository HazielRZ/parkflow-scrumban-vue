import { createRouter, createWebHistory } from 'vue-router'
import ScrumbanBoard from '@/components/ScrumbanBoard.vue'
import ErsTraceabilityView from '@/components/ErsTraceabilityView.vue'
import InstitutionalLoginView from '@/components/InstitutionalLoginView.vue'
import { useAuthStore } from '@/stores/useAuthStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'institutional-login',
      component: InstitutionalLoginView,
      meta: { hideNavbar: true }
    },
    {
      path: '/',
      name: 'scrumban-board',
      component: ScrumbanBoard,
      meta: { requiresAuth: true }
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
      component: ErsTraceabilityView,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }
  if (to.path === '/login' && authStore.isAuthenticated) {
    return { path: authStore.isReadOnly ? '/guest' : '/' }
  }
})

export default router
