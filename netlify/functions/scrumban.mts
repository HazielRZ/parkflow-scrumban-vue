import { getStore } from '@netlify/blobs'
import crypto from 'node:crypto'

interface AccountCredential {
  id: string
  email: string
  controlNumber: string
  alternateInputs: string[]
  rbacRole: 'ADMIN_PO_SM' | 'TECH_LEAD' | 'DEV_QA' | 'DEVELOPER' | 'GUEST_VIEWER'
  passwordHashHex: string
  envPasswordOverride?: string
}

const PASSWORD_SALT = 'pf-tecnm-2026-salt::'
const TOKEN_SECRET =
  process.env.PARKFLOW_JWT_SECRET ||
  'pf-scrumban-hmac-secret-2026-morelia-tecnm-isic-9ef8a7b6c5d4e3f2'
const TOKEN_TTL_MS = 12 * 60 * 60 * 1000 // 12 horas

/**
 * Cuentas oficiales con hashes SHA-256 salados (CERO contraseñas en texto plano en el código).
 * Ninguna cuenta acepta ya el número de control como contraseña.
 */
const OFFICIAL_ACCOUNTS: AccountCredential[] = [
  {
    id: 'member-haziel',
    email: 'l221213339@morelia.tecnm.mx',
    controlNumber: '221213339',
    alternateInputs: ['221213339'],
    rbacRole: 'ADMIN_PO_SM',
    passwordHashHex: '3b17f2aaab74689f4c7e60e5776506c8c50adb83b651afd1fabda9a8bcc06d64',
    envPasswordOverride: process.env.PARKFLOW_PASS_HAZIEL
  },
  {
    id: 'member-rodrigo',
    email: 'l23121118@morelia.tecnm.mx',
    controlNumber: '23121118',
    alternateInputs: ['23121118'],
    rbacRole: 'TECH_LEAD',
    passwordHashHex: '99c9fc9a6bb23a51a3927d3019bd105f145ae6c23a0621b2700963c8bc05f83d',
    envPasswordOverride: process.env.PARKFLOW_PASS_RODRIGO
  },
  {
    id: 'member-miguel',
    email: 'l23121135@morelia.tecnm.mx',
    controlNumber: '23121135',
    alternateInputs: ['23121135'],
    rbacRole: 'DEV_QA',
    passwordHashHex: '4d9f3390375737aa62e90737e37bb9fe6ce02cc1d86b6b469c68a11eda05f3e8',
    envPasswordOverride: process.env.PARKFLOW_PASS_MIGUEL
  },
  {
    id: 'member-julio',
    email: 'l23121112@morelia.tecnm.mx',
    controlNumber: '23121112',
    alternateInputs: ['23121112'],
    rbacRole: 'DEVELOPER',
    passwordHashHex: '7d797506dcf274a0741122cfa092783aac258c7df011a8558d2979d538aa93a2',
    envPasswordOverride: process.env.PARKFLOW_PASS_JULIO
  },
  {
    id: 'member-luis',
    email: 'l24121432@morelia.tecnm.mx',
    controlNumber: '24120432',
    alternateInputs: ['l24120432@morelia.tecnm.mx', '24120432'],
    rbacRole: 'DEVELOPER',
    passwordHashHex: 'a6ea0afa1c18c320a98ff5c7bc8e0701a8c1cbb92c20afc6c510575cd1379c22',
    envPasswordOverride: process.env.PARKFLOW_PASS_LUIS
  }
]

// Rate Limiter en memoria contra ataques de fuerza bruta (máx 5 intentos fallidos / 5 min)
const failedLoginTracker = new Map<string, { count: number; lockUntil: number }>()
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_MS = 5 * 60 * 1000

const STORE_NAME = 'parkflow-scrumban'
const STATE_KEY = 'board-state-v1'

interface TokenPayload {
  memberId: string
  email: string
  rbacRole: AccountCredential['rbacRole']
  iat: number
  exp: number
}

const computeSaltedHashHex = (plainPassword: string): string => {
  return crypto
    .createHash('sha256')
    .update(PASSWORD_SALT + plainPassword)
    .digest('hex')
}

const timingSafeVerifyPassword = (account: AccountCredential, candidatePassword: string): boolean => {
  if (account.envPasswordOverride && account.envPasswordOverride.length >= 8) {
    const a = Buffer.from(computeSaltedHashHex(account.envPasswordOverride), 'hex')
    const b = Buffer.from(computeSaltedHashHex(candidatePassword), 'hex')
    return a.length === b.length && crypto.timingSafeEqual(a, b)
  }

  const expectedBuf = Buffer.from(account.passwordHashHex, 'hex')
  const candidateBuf = Buffer.from(computeSaltedHashHex(candidatePassword), 'hex')
  return (
    expectedBuf.length === candidateBuf.length &&
    crypto.timingSafeEqual(expectedBuf, candidateBuf)
  )
}

const signSessionToken = (payload: TokenPayload): string => {
  const payloadB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url')
  const sigB64 = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url')
  return `${payloadB64}.${sigB64}`
}

const verifySessionToken = (token?: string | null): TokenPayload | null => {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null
  const [payloadB64, providedSigB64] = token.split('.')
  if (!payloadB64 || !providedSigB64) return null

  const expectedSigB64 = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url')

  const bufA = Buffer.from(expectedSigB64)
  const bufB = Buffer.from(providedSigB64)
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null
  }

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8')) as TokenPayload
    if (!parsed.exp || Date.now() > parsed.exp) {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    }
  })

export default async (req: Request) => {
  try {
    if (req.method === 'GET') {
      const store = getStore(STORE_NAME)
      const saved = await store.get(STATE_KEY, { type: 'json' })
      return jsonResponse(200, {
        ok: true,
        state: saved || null
      })
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const rawText = await req.text()
      // Protección DoS: rechazar payloads mayores a 512 KB
      if (rawText.length > 512_000) {
        return jsonResponse(413, {
          ok: false,
          message: 'El tamaño de la solicitud excede el límite de seguridad permitido (512 KB).'
        })
      }

      const body = JSON.parse(rawText)

      // 1. Autenticación en servidor con Rate-Limiting y Firma HMAC-SHA256 (RNF-02)
      if (body.action === 'LOGIN') {
        const rawIdentifier = String(body.identifier || '')
          .trim()
          .toLowerCase()
        const rawPassword = String(body.password || '').trim()
        const clientIp =
          req.headers.get('x-nf-client-connection-ip') ||
          req.headers.get('x-forwarded-for') ||
          'unknown-ip'
        const throttleKey = `${clientIp}::${rawIdentifier}`

        const now = Date.now()
        const throttleRecord = failedLoginTracker.get(throttleKey)
        if (throttleRecord && throttleRecord.lockUntil > now) {
          const remainingSec = Math.ceil((throttleRecord.lockUntil - now) / 1000)
          return jsonResponse(429, {
            ok: false,
            message: `Demasiados intentos fallidos. Por seguridad tu acceso está bloqueado temporalmente (${remainingSec} s restantes).`
          })
        }

        const matched = OFFICIAL_ACCOUNTS.find(
          (acc) =>
            acc.email.toLowerCase() === rawIdentifier ||
            acc.controlNumber.toLowerCase() === rawIdentifier ||
            acc.alternateInputs.some((alt) => alt.toLowerCase() === rawIdentifier)
        )

        if (!matched || !timingSafeVerifyPassword(matched, rawPassword)) {
          const currentCount = (throttleRecord?.count || 0) + 1
          failedLoginTracker.set(throttleKey, {
            count: currentCount,
            lockUntil: currentCount >= MAX_FAILED_ATTEMPTS ? now + LOCKOUT_MS : 0
          })
          return jsonResponse(401, {
            ok: false,
            message:
              'Credenciales inválidas. Verifica tu correo @morelia.tecnm.mx y tu contraseña personal.'
          })
        }

        // Limpiar contador de intentos fallidos tras login exitoso
        failedLoginTracker.delete(throttleKey)

        const tokenPayload: TokenPayload = {
          memberId: matched.id,
          email: matched.email,
          rbacRole: matched.rbacRole,
          iat: now,
          exp: now + TOKEN_TTL_MS
        }
        const sessionToken = signSessionToken(tokenPayload)

        return jsonResponse(200, {
          ok: true,
          memberId: matched.id,
          email: matched.email,
          rbacRole: matched.rbacRole,
          sessionToken,
          expiresAt: tokenPayload.exp
        })
      }

      // 2. Verificación de integridad de sesión activa
      if (body.action === 'VERIFY_SESSION') {
        const authHeader = req.headers.get('authorization')
        const rawToken = authHeader?.startsWith('Bearer ')
          ? authHeader.slice(7)
          : String(body.sessionToken || '')
        const verified = verifySessionToken(rawToken)
        if (!verified) {
          return jsonResponse(401, {
            ok: false,
            message: 'Token de sesión expirado o manipulado.'
          })
        }
        return jsonResponse(200, {
          ok: true,
          session: verified
        })
      }

      // 3. Persistencia en Netlify Blobs con Verificación Criptográfica de Token y Reglas RBAC
      if (body.action === 'SAVE_STATE') {
        const authHeader = req.headers.get('authorization')
        const rawToken = authHeader?.startsWith('Bearer ')
          ? authHeader.slice(7)
          : String(body.sessionToken || '')

        const verifiedSession = verifySessionToken(rawToken)
        if (!verifiedSession) {
          return jsonResponse(401, {
            ok: false,
            message:
              'Bloqueo de Seguridad: Token de sesión ausente, expirado o manipulado en DevTools. Inicia sesión nuevamente.'
          })
        }

        const { rbacRole, email, memberId } = verifiedSession
        const isSprintMutation = Boolean(body.isSprintMutation)

        if (rbacRole === 'GUEST_VIEWER') {
          return jsonResponse(403, {
            ok: false,
            message:
              'Bloqueo RBAC Servidor: El rol GUEST_VIEWER es estrictamente de solo lectura.'
          })
        }

        if (
          isSprintMutation &&
          (rbacRole !== 'ADMIN_PO_SM' ||
            email.toLowerCase() !== 'l221213339@morelia.tecnm.mx' ||
            memberId !== 'member-haziel')
        ) {
          return jsonResponse(403, {
            ok: false,
            message:
              'Bloqueo RBAC Servidor: Únicamente Haziel Ruiz Zúñiga (l221213339@morelia.tecnm.mx — ADMIN_PO_SM) puede iniciar, editar o completar Sprints.'
          })
        }

        const store = getStore(STORE_NAME)
        const existingState = (await store.get(STATE_KEY, { type: 'json' })) as {
          tasks?: Array<{ key: string; columnId: string }>
          sprints?: Array<{ id: string; status: string }>
        } | null

        // Verificación profunda de estado en servidor para impedir que un DEVELOPER o QA
        // modifique Sprints o que un DEVELOPER pase tareas a DONE vía consola/API directa
        if (existingState && Array.isArray(existingState.sprints) && Array.isArray(body.sprints)) {
          const sprintStatusChanged = existingState.sprints.some((oldSp) => {
            const newSp = body.sprints.find((s: { id: string }) => s.id === oldSp.id)
            return newSp && newSp.status !== oldSp.status
          })
          if (sprintStatusChanged && rbacRole !== 'ADMIN_PO_SM') {
            return jsonResponse(403, {
              ok: false,
              message:
                'Bloqueo Anti-Sabotaje Servidor: Se detectó un intento no autorizado de alterar el estado de un Sprint.'
            })
          }
        }

        if (
          rbacRole === 'DEVELOPER' &&
          existingState &&
          Array.isArray(existingState.tasks) &&
          Array.isArray(body.tasks)
        ) {
          // Un DEVELOPER no puede eliminar tareas ni pasar una tarea a DONE
          if (body.tasks.length < existingState.tasks.length) {
            return jsonResponse(403, {
              ok: false,
              message: 'Bloqueo RBAC Servidor: Un Developer no tiene permisos para eliminar tareas.'
            })
          }
          const movedToDoneIllegally = body.tasks.some(
            (newTask: { key: string; columnId: string }) => {
              const oldTask = existingState.tasks?.find((t) => t.key === newTask.key)
              return oldTask && oldTask.columnId !== 'DONE' && newTask.columnId === 'DONE'
            }
          )
          if (movedToDoneIllegally) {
            return jsonResponse(403, {
              ok: false,
              message:
                'Bloqueo RBAC Servidor: Un Developer no puede auto-aprobar Code Review (pasar a DONE).'
            })
          }
        }

        const updatedAt = new Date().toISOString()
        const payloadToSave = {
          tasks: body.tasks,
          sprints: body.sprints,
          auditLog: body.auditLog,
          updatedAt
        }

        await store.setJSON(STATE_KEY, payloadToSave)

        return jsonResponse(200, {
          ok: true,
          updatedAt
        })
      }

      return jsonResponse(400, { ok: false, message: 'Acción no reconocida.' })
    }

    return jsonResponse(405, { ok: false, message: 'Método HTTP no permitido.' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error interno en Netlify Function'
    return jsonResponse(500, { ok: false, message: msg })
  }
}
