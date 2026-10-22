import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { TEAM_MEMBERS_SEED } from '@/data/parkflowSeed'
import type { Role, TeamMember } from '@/types/scrumban'

const STORAGE_AUTH_USER_KEY = 'parkflow_scrumban_current_user_v2'
const STORAGE_AUTH_SESSION_KEY = 'parkflow_scrumban_authenticated_v2'

// Mapa estricto de contraseñas válidas por integrante para fallback local y validación instantánea
const LOCAL_PASSWORDS_MAP: Record<string, string[]> = {
  'member-haziel': ['PF-Haziel#221213339', '221213339', 'Haziel2026!'],
  'member-rodrigo': ['PF-Rodrigo#23121118', '23121118'],
  'member-miguel': ['PF-Miguel#23121135', '23121135'],
  'member-julio': ['PF-Julio#23121112', '23121112'],
  'member-luis': ['PF-Luis#24120432', '24120432']
}

export const useAuthStore = defineStore('auth', () => {
  const members = ref<TeamMember[]>(TEAM_MEMBERS_SEED)

  const loadInitialUser = (): TeamMember => {
    try {
      const savedId = localStorage.getItem(STORAGE_AUTH_USER_KEY)
      if (savedId) {
        const found = TEAM_MEMBERS_SEED.find((m) => m.id === savedId)
        if (found) return found
      }
    } catch {
      // fallback
    }
    return TEAM_MEMBERS_SEED.find((m) => m.rbacRole === 'GUEST_VIEWER') || TEAM_MEMBERS_SEED[0]
  }

  const loadInitialSession = (): boolean => {
    try {
      return localStorage.getItem(STORAGE_AUTH_SESSION_KEY) === 'true'
    } catch {
      return false
    }
  }

  const currentUser = ref<TeamMember>(loadInitialUser())
  const isAuthenticated = ref<boolean>(loadInitialSession())
  const isLoginModalOpen = ref(false)
  const authError = ref<string | null>(null)
  const isAuthenticating = ref(false)

  const currentRole = computed<Role>(() => currentUser.value.rbacRole)
  const isReadOnly = computed<boolean>(() => currentUser.value.rbacRole === 'GUEST_VIEWER')
  const isAdminPoSm = computed<boolean>(() => currentUser.value.rbacRole === 'ADMIN_PO_SM')

  // Solo Haziel (ADMIN_PO_SM) puede iniciar, editar o completar/cerrar Sprints
  const canManageSprints = computed<boolean>(() => currentUser.value.rbacRole === 'ADMIN_PO_SM')

  // Solo ADMIN_PO_SM, TECH_LEAD o DEV_QA pueden pasar de IN_REVIEW a DONE
  const canApproveCodeReview = computed<boolean>(() =>
    ['ADMIN_PO_SM', 'TECH_LEAD', 'DEV_QA'].includes(currentUser.value.rbacRole)
  )

  // Solo ADMIN_PO_SM o TECH_LEAD pueden crear, editar o eliminar tareas del Backlog
  const canCreateOrEditTasks = computed<boolean>(() =>
    ['ADMIN_PO_SM', 'TECH_LEAD'].includes(currentUser.value.rbacRole)
  )

  const persistSession = (memberId: string, authenticated: boolean) => {
    try {
      localStorage.setItem(STORAGE_AUTH_USER_KEY, memberId)
      localStorage.setItem(STORAGE_AUTH_SESSION_KEY, authenticated ? 'true' : 'false')
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Autenticación estricta con contraseña por integrante (RNF-02).
   * Intenta validar primero contra la Netlify Function (/api/scrumban) y usa el validador
   * estricto local si se ejecuta con Vite dev server sin Netlify CLI.
   */
  const loginWithCredentials = async (
    rawIdentifier: string,
    rawPassword: string
  ): Promise<{ ok: boolean; message: string }> => {
    const normalized = rawIdentifier.trim().toLowerCase()
    const password = rawPassword.trim()

    if (!normalized || !password) {
      authError.value =
        'Ingresa tu correo institucional @morelia.tecnm.mx (o No. de Control) y tu contraseña.'
      return { ok: false, message: authError.value }
    }

    isAuthenticating.value = true
    authError.value = null

    try {
      // Intentar validación en Netlify Function (/api/scrumban)
      const res = await fetch('/api/scrumban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'LOGIN',
          identifier: normalized,
          password
        })
      })

      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('application/json')) {
        const data = await res.json()
        if (!res.ok || !data.ok) {
          authError.value = data.message || 'Credenciales inválidas.'
          isAuthenticating.value = false
          return { ok: false, message: authError.value! }
        }

        const matchedMember = members.value.find((m) => m.id === data.memberId)
        if (matchedMember) {
          currentUser.value = matchedMember
          isAuthenticated.value = true
          persistSession(matchedMember.id, true)
          isAuthenticating.value = false
          return {
            ok: true,
            message: `Sesión iniciada como ${matchedMember.name} (${matchedMember.rbacRole})`
          }
        }
      }
    } catch {
      // Fallback en modo desarrollo local (vite dev) con validación estricta
    }

    // Validación estricta local (mismas reglas que la Netlify Function)
    const matched = members.value.find((m) => {
      if (m.rbacRole === 'GUEST_VIEWER') return false
      if (m.email.toLowerCase() === normalized) return true
      if (m.controlNumber.toLowerCase() === normalized) return true
      if (m.alternateEmails?.some((alt) => alt.toLowerCase() === normalized)) return true
      return false
    })

    isAuthenticating.value = false

    if (!matched) {
      authError.value =
        'Acceso denegado (RNF-02): Correo o Número de Control no registrado en el equipo PARK FLOW. Si eres evaluador usa "Vista Evaluador / Invitado (/guest)".'
      return { ok: false, message: authError.value }
    }

    const allowedPasswords = LOCAL_PASSWORDS_MAP[matched.id] || []
    if (!allowedPasswords.includes(password)) {
      authError.value =
        'Contraseña incorrecta para esta cuenta institucional @morelia.tecnm.mx.'
      return { ok: false, message: authError.value }
    }

    currentUser.value = matched
    isAuthenticated.value = true
    authError.value = null
    persistSession(matched.id, true)
    return {
      ok: true,
      message: `Sesión verificada: ${matched.name} (${matched.rbacRole})`
    }
  }

  /**
   * Acceso directo sin contraseña únicamente para el modo Evaluador / Invitado (Read-Only)
   * según Regla 5.3 de AGENTS.md (Prof. Alma Lilia Núñez González / Invitados).
   */
  const enterGuestEvaluatorMode = () => {
    const guest = members.value.find((m) => m.rbacRole === 'GUEST_VIEWER')
    if (guest) {
      currentUser.value = guest
      isAuthenticated.value = true
      authError.value = null
      persistSession(guest.id, true)
    }
    isLoginModalOpen.value = false
  }

  const logout = () => {
    isAuthenticated.value = false
    authError.value = null
    try {
      localStorage.setItem(STORAGE_AUTH_SESSION_KEY, 'false')
    } catch {
      // ignore
    }
  }

  const getMemberById = (memberId?: string): TeamMember | undefined => {
    if (!memberId) return undefined
    return members.value.find((m) => m.id === memberId)
  }

  const roleBadgeLabel = (role: Role): string => {
    switch (role) {
      case 'ADMIN_PO_SM':
        return 'PO & Scrum Master (Admin)'
      case 'TECH_LEAD':
        return 'Tech Lead / Arquitecto'
      case 'DEV_QA':
        return 'DevOps & QA'
      case 'DEVELOPER':
        return 'Developer'
      case 'GUEST_VIEWER':
        return 'Evaluador / Invitado (Read-Only)'
    }
  }

  return {
    members,
    currentUser,
    isAuthenticated,
    isAuthenticating,
    currentRole,
    isReadOnly,
    isAdminPoSm,
    canManageSprints,
    canApproveCodeReview,
    canCreateOrEditTasks,
    isLoginModalOpen,
    authError,
    loginWithCredentials,
    enterGuestEvaluatorMode,
    logout,
    getMemberById,
    roleBadgeLabel
  }
})
