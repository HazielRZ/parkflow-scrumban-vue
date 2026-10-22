import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { TEAM_MEMBERS_SEED } from '@/data/parkflowSeed'
import type { Role, TeamMember } from '@/types/scrumban'

const STORAGE_AUTH_KEY = 'parkflow_scrumban_current_user_v1'

export const useAuthStore = defineStore('auth', () => {
  const members = ref<TeamMember[]>(TEAM_MEMBERS_SEED)

  const loadInitialUser = (): TeamMember => {
    try {
      const savedId = localStorage.getItem(STORAGE_AUTH_KEY)
      if (savedId) {
        const found = TEAM_MEMBERS_SEED.find((m) => m.id === savedId)
        if (found) return found
      }
    } catch {
      // Fallback to Haziel (ADMIN_PO_SM)
    }
    return TEAM_MEMBERS_SEED[0]
  }

  const currentUser = ref<TeamMember>(loadInitialUser())
  const isLoginModalOpen = ref(false)
  const authError = ref<string | null>(null)

  const currentRole = computed<Role>(() => currentUser.value.rbacRole)
  const isReadOnly = computed<boolean>(() => currentUser.value.rbacRole === 'GUEST_VIEWER')
  const isAdminPoSm = computed<boolean>(() => currentUser.value.rbacRole === 'ADMIN_PO_SM')

  // Solo Haziel (ADMIN_PO_SM) puede iniciar, editar o completar/cerrar Sprints
  const canManageSprints = computed<boolean>(() => currentUser.value.rbacRole === 'ADMIN_PO_SM')

  // Solo ADMIN_PO_SM, TECH_LEAD o DEV_QA pueden pasar de IN_REVIEW a DONE
  const canApproveCodeReview = computed<boolean>(() =>
    ['ADMIN_PO_SM', 'TECH_LEAD', 'DEV_QA'].includes(currentUser.value.rbacRole)
  )

  // Solo ADMIN_PO_SM o TECH_LEAD pueden crear nuevas tareas o editar prioridades del Backlog
  const canCreateOrEditTasks = computed<boolean>(() =>
    ['ADMIN_PO_SM', 'TECH_LEAD'].includes(currentUser.value.rbacRole)
  )

  const saveUserToStorage = (memberId: string) => {
    try {
      localStorage.setItem(STORAGE_AUTH_KEY, memberId)
    } catch {
      // ignore storage errors
    }
  }

  const switchUserById = (memberId: string): boolean => {
    const found = members.value.find((m) => m.id === memberId)
    if (!found) return false
    currentUser.value = found
    authError.value = null
    saveUserToStorage(found.id)
    return true
  }

  /**
   * Autenticación institucional @morelia.tecnm.mx o por número de control.
   * Acepta para Luis Antonio Anzaldua Mendez tanto l24121432@morelia.tecnm.mx,
   * l24120432@morelia.tecnm.mx como su número de control 24120432.
   */
  const loginWithInstitutionalInput = (rawInput: string): { ok: boolean; message: string } => {
    const normalized = rawInput.trim().toLowerCase()
    if (!normalized) {
      authError.value = 'Ingresa un correo institucional @morelia.tecnm.mx o número de control.'
      return { ok: false, message: authError.value }
    }

    const matched = members.value.find((m) => {
      if (m.email.toLowerCase() === normalized) return true
      if (m.controlNumber.toLowerCase() === normalized) return true
      if (m.alternateEmails?.some((alt) => alt.toLowerCase() === normalized)) return true
      return false
    })

    if (matched) {
      currentUser.value = matched
      authError.value = null
      saveUserToStorage(matched.id)
      isLoginModalOpen.value = false
      return {
        ok: true,
        message: `Sesión iniciada como ${matched.name} (${matched.rbacRole})`
      }
    }

    if (normalized.endsWith('@morelia.tecnm.mx')) {
      // Cualquier otro correo @morelia.tecnm.mx entra como Evaluador/Invitado Read-Only
      const guestProfile = members.value.find((m) => m.rbacRole === 'GUEST_VIEWER')!
      currentUser.value = {
        ...guestProfile,
        email: normalized
      }
      authError.value = null
      saveUserToStorage(guestProfile.id)
      isLoginModalOpen.value = false
      return {
        ok: true,
        message: `Acceso institucional de solo lectura concedido para ${normalized}`
      }
    }

    authError.value =
      'Acceso denegado (RNF-02): Se requiere correo institucional @morelia.tecnm.mx o número de control registrado del equipo PARK FLOW.'
    return { ok: false, message: authError.value }
  }

  const enterGuestEvaluatorMode = () => {
    const guest = members.value.find((m) => m.rbacRole === 'GUEST_VIEWER')
    if (guest) {
      currentUser.value = guest
      authError.value = null
      saveUserToStorage(guest.id)
    }
    isLoginModalOpen.value = false
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
    currentRole,
    isReadOnly,
    isAdminPoSm,
    canManageSprints,
    canApproveCodeReview,
    canCreateOrEditTasks,
    isLoginModalOpen,
    authError,
    switchUserById,
    loginWithInstitutionalInput,
    enterGuestEvaluatorMode,
    getMemberById,
    roleBadgeLabel
  }
})
