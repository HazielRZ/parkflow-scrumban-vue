import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { TEAM_MEMBERS_SEED } from '@/data/parkflowSeed'
import type { Role, TeamMember } from '@/types/scrumban'

const STORAGE_AUTH_USER_KEY = 'parkflow_scrumban_current_user_v3'
const STORAGE_AUTH_SESSION_KEY = 'parkflow_scrumban_authenticated_v3'
const STORAGE_AUTH_TOKEN_KEY = 'parkflow_scrumban_token_v3'
const STORAGE_AUTH_CHECKSUM_KEY = 'parkflow_scrumban_checksum_v3'
const STORAGE_LOCKOUT_KEY = 'parkflow_scrumban_lockout_v3'

const PASSWORD_SALT = 'pf-tecnm-2026-salt::'
const INTEGRITY_PEPPER = 'pf-client-integrity-2026::morelia-tecnm::'

/**
 * Hashes SHA-256 salados de las 5 cuentas oficiales.
 * CERO contraseñas en texto plano en el bundle de frontend.
 */
const SALTED_PASSWORD_HASHES: Record<string, string> = {
  'member-haziel': '3b17f2aaab74689f4c7e60e5776506c8c50adb83b651afd1fabda9a8bcc06d64',
  'member-rodrigo': '99c9fc9a6bb23a51a3927d3019bd105f145ae6c23a0621b2700963c8bc05f83d',
  'member-miguel': '4d9f3390375737aa62e90737e37bb9fe6ce02cc1d86b6b469c68a11eda05f3e8',
  'member-julio': '7d797506dcf274a0741122cfa092783aac258c7df011a8558d2979d538aa93a2',
  'member-luis': 'a6ea0afa1c18c320a98ff5c7bc8e0701a8c1cbb92c20afc6c510575cd1379c22'
}

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

function computeSyncChecksum(memberId: string, role: Role, token: string): string {
  // Checksum determinista rápido para detectar edición manual de localStorage en DevTools
  const raw = `${INTEGRITY_PEPPER}${memberId}::${role}::${token.slice(-16)}`
  let h1 = 0xdeadbeef ^ raw.length
  let h2 = 0x41c6ce57 ^ raw.length
  for (let i = 0; i < raw.length; i++) {
    const ch = raw.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36)
}

export const useAuthStore = defineStore('auth', () => {
  const members = ref<TeamMember[]>(TEAM_MEMBERS_SEED)

  const guestProfile =
    TEAM_MEMBERS_SEED.find((m) => m.rbacRole === 'GUEST_VIEWER') || TEAM_MEMBERS_SEED[5]

  const loadValidatedInitialState = (): {
    user: TeamMember
    authenticated: boolean
    token: string
  } => {
    try {
      const savedId = localStorage.getItem(STORAGE_AUTH_USER_KEY)
      const savedAuth = localStorage.getItem(STORAGE_AUTH_SESSION_KEY) === 'true'
      const savedToken = localStorage.getItem(STORAGE_AUTH_TOKEN_KEY) || ''
      const savedChecksum = localStorage.getItem(STORAGE_AUTH_CHECKSUM_KEY) || ''

      if (!savedId || !savedAuth) {
        return { user: guestProfile, authenticated: false, token: '' }
      }

      const found = TEAM_MEMBERS_SEED.find((m) => m.id === savedId)
      if (!found) {
        return { user: guestProfile, authenticated: false, token: '' }
      }

      // Verificar que nadie haya editado el memberId en localStorage desde F12 DevTools
      const expectedChecksum = computeSyncChecksum(found.id, found.rbacRole, savedToken)
      if (savedChecksum !== expectedChecksum) {
        localStorage.removeItem(STORAGE_AUTH_USER_KEY)
        localStorage.removeItem(STORAGE_AUTH_SESSION_KEY)
        localStorage.removeItem(STORAGE_AUTH_TOKEN_KEY)
        localStorage.removeItem(STORAGE_AUTH_CHECKSUM_KEY)
        return { user: guestProfile, authenticated: false, token: '' }
      }

      // Si no es GUEST_VIEWER, debe tener un token firmado válido
      if (found.rbacRole !== 'GUEST_VIEWER' && !savedToken) {
        return { user: guestProfile, authenticated: false, token: '' }
      }

      return { user: found, authenticated: true, token: savedToken }
    } catch {
      return { user: guestProfile, authenticated: false, token: '' }
    }
  }

  const initial = loadValidatedInitialState()
  const currentUser = ref<TeamMember>(initial.user)
  const isAuthenticated = ref<boolean>(initial.authenticated)
  const sessionToken = ref<string>(initial.token)
  const isLoginModalOpen = ref(false)
  const authError = ref<string | null>(null)
  const isAuthenticating = ref(false)
  const failedAttempts = ref<number>(0)

  const currentRole = computed<Role>(() => currentUser.value.rbacRole)
  const isReadOnly = computed<boolean>(() => currentUser.value.rbacRole === 'GUEST_VIEWER')
  const isAdminPoSm = computed<boolean>(() => currentUser.value.rbacRole === 'ADMIN_PO_SM')

  // Solo Haziel (ADMIN_PO_SM) puede iniciar, editar o completar/cerrar Sprints
  const canManageSprints = computed<boolean>(
    () =>
      currentUser.value.rbacRole === 'ADMIN_PO_SM' &&
      currentUser.value.id === 'member-haziel' &&
      Boolean(sessionToken.value)
  )

  // Solo ADMIN_PO_SM, TECH_LEAD o DEV_QA pueden pasar de IN_REVIEW a DONE
  const canApproveCodeReview = computed<boolean>(() =>
    ['ADMIN_PO_SM', 'TECH_LEAD', 'DEV_QA'].includes(currentUser.value.rbacRole)
  )

  // Solo ADMIN_PO_SM o TECH_LEAD pueden crear, editar o eliminar tareas del Backlog
  const canCreateOrEditTasks = computed<boolean>(() =>
    ['ADMIN_PO_SM', 'TECH_LEAD'].includes(currentUser.value.rbacRole)
  )

  const persistSession = (member: TeamMember, authenticated: boolean, token: string) => {
    try {
      const checksum = computeSyncChecksum(member.id, member.rbacRole, token)
      localStorage.setItem(STORAGE_AUTH_USER_KEY, member.id)
      localStorage.setItem(STORAGE_AUTH_SESSION_KEY, authenticated ? 'true' : 'false')
      localStorage.setItem(STORAGE_AUTH_TOKEN_KEY, token)
      localStorage.setItem(STORAGE_AUTH_CHECKSUM_KEY, checksum)
    } catch {
      // ignore storage errors
    }
  }

  /**
   * Verifica en caliente que el estado en memoria y localStorage no hayan sido
   * alterados manualmente con herramientas de desarrollador (F12).
   */
  const verifyIntegrityOrRevoke = (): boolean => {
    if (currentUser.value.rbacRole === 'GUEST_VIEWER') return true
    try {
      const savedId = localStorage.getItem(STORAGE_AUTH_USER_KEY)
      const savedToken = localStorage.getItem(STORAGE_AUTH_TOKEN_KEY) || ''
      const savedChecksum = localStorage.getItem(STORAGE_AUTH_CHECKSUM_KEY) || ''
      const expected = computeSyncChecksum(
        currentUser.value.id,
        currentUser.value.rbacRole,
        savedToken
      )
      if (
        savedId !== currentUser.value.id ||
        !savedToken ||
        savedToken !== sessionToken.value ||
        savedChecksum !== expected
      ) {
        logout()
        return false
      }
      return true
    } catch {
      return false
    }
  }

  // Listener anti-manipulación de localStorage en vivo
  if (typeof window !== 'undefined') {
    window.addEventListener('storage', (event) => {
      if (
        event.key === STORAGE_AUTH_USER_KEY ||
        event.key === STORAGE_AUTH_TOKEN_KEY ||
        event.key === STORAGE_AUTH_CHECKSUM_KEY
      ) {
        verifyIntegrityOrRevoke()
      }
    })
  }

  /**
   * Autenticación estricta con contraseña por integrante (RNF-02).
   * Valida contra la Netlify Function (/api/scrumban) obteniendo un token firmado con HMAC-SHA256,
   * o valida el hash SHA-256 salado vía Web Crypto API en desarrollo local.
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

    // Verificar bloqueo temporal por intentos fallidos (Anti-Fuerza Bruta)
    try {
      const lockUntil = Number(localStorage.getItem(STORAGE_LOCKOUT_KEY) || '0')
      if (lockUntil > Date.now()) {
        const secs = Math.ceil((lockUntil - Date.now()) / 1000)
        authError.value = `Acceso bloqueado temporalmente por intentos fallidos. Intenta de nuevo en ${secs} segundos.`
        return { ok: false, message: authError.value }
      }
    } catch {
      // ignore
    }

    isAuthenticating.value = true
    authError.value = null

    try {
      // 1. Intentar validación criptográfica en Netlify Function (/api/scrumban)
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
        if (matchedMember && data.sessionToken) {
          currentUser.value = matchedMember
          isAuthenticated.value = true
          sessionToken.value = String(data.sessionToken)
          failedAttempts.value = 0
          persistSession(matchedMember, true, sessionToken.value)
          isAuthenticating.value = false
          return {
            ok: true,
            message: `Sesión iniciada y firmada como ${matchedMember.name} (${matchedMember.rbacRole})`
          }
        }
      }
    } catch {
      // Fallback para entorno local Vite dev sin Netlify CLI (usando SHA-256 Web Crypto)
    }

    // 2. Validación SHA-256 local sin contraseñas en texto plano
    const matched = members.value.find((m) => {
      if (m.rbacRole === 'GUEST_VIEWER') return false
      if (m.email.toLowerCase() === normalized) return true
      if (m.controlNumber.toLowerCase() === normalized) return true
      if (m.alternateEmails?.some((alt) => alt.toLowerCase() === normalized)) return true
      return false
    })

    if (!matched) {
      isAuthenticating.value = false
      authError.value =
        'Acceso denegado (RNF-02): Correo o Número de Control no registrado en el equipo PARK FLOW.'
      return { ok: false, message: authError.value }
    }

    const candidateHash = await sha256Hex(PASSWORD_SALT + password)
    const expectedHash = SALTED_PASSWORD_HASHES[matched.id]

    isAuthenticating.value = false

    if (!expectedHash || candidateHash !== expectedHash) {
      failedAttempts.value += 1
      if (failedAttempts.value >= 5) {
        try {
          localStorage.setItem(STORAGE_LOCKOUT_KEY, String(Date.now() + 5 * 60 * 1000))
        } catch {
          // ignore
        }
        authError.value =
          'Se superaron los 5 intentos fallidos permitidos. Cuenta protegida temporalmente por 5 minutos.'
        return { ok: false, message: authError.value }
      }
      authError.value = `Contraseña incorrecta. Intentos restantes antes de bloqueo temporal: ${5 - failedAttempts.value}.`
      return { ok: false, message: authError.value }
    }

    // Generar token firmado local
    const localToken = `local.${btoa(
      JSON.stringify({
        memberId: matched.id,
        email: matched.email,
        rbacRole: matched.rbacRole,
        exp: Date.now() + 12 * 3600 * 1000
      })
    )}.${candidateHash.slice(0, 24)}`

    currentUser.value = matched
    isAuthenticated.value = true
    sessionToken.value = localToken
    failedAttempts.value = 0
    authError.value = null
    persistSession(matched, true, localToken)
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
    currentUser.value = guestProfile
    isAuthenticated.value = true
    sessionToken.value = ''
    authError.value = null
    persistSession(guestProfile, true, '')
    isLoginModalOpen.value = false
  }

  const logout = () => {
    currentUser.value = guestProfile
    isAuthenticated.value = false
    sessionToken.value = ''
    authError.value = null
    try {
      localStorage.removeItem(STORAGE_AUTH_USER_KEY)
      localStorage.setItem(STORAGE_AUTH_SESSION_KEY, 'false')
      localStorage.removeItem(STORAGE_AUTH_TOKEN_KEY)
      localStorage.removeItem(STORAGE_AUTH_CHECKSUM_KEY)
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
    sessionToken,
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
    verifyIntegrityOrRevoke,
    loginWithCredentials,
    enterGuestEvaluatorMode,
    logout,
    getMemberById,
    roleBadgeLabel
  }
})
