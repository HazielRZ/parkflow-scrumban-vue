import { getStore } from '@netlify/blobs'

interface AccountCredential {
  id: string
  email: string
  controlNumber: string
  alternateInputs: string[]
  rbacRole: 'ADMIN_PO_SM' | 'TECH_LEAD' | 'DEV_QA' | 'DEVELOPER' | 'GUEST_VIEWER'
  validPasswords: string[]
}

const OFFICIAL_ACCOUNTS: AccountCredential[] = [
  {
    id: 'member-haziel',
    email: 'l221213339@morelia.tecnm.mx',
    controlNumber: '221213339',
    alternateInputs: ['221213339'],
    rbacRole: 'ADMIN_PO_SM',
    validPasswords: [
      process.env.PARKFLOW_PASS_HAZIEL || 'PF-Haziel#221213339',
      '221213339',
      'Haziel2026!'
    ]
  },
  {
    id: 'member-rodrigo',
    email: 'l23121118@morelia.tecnm.mx',
    controlNumber: '23121118',
    alternateInputs: ['23121118'],
    rbacRole: 'TECH_LEAD',
    validPasswords: [
      process.env.PARKFLOW_PASS_RODRIGO || 'PF-Rodrigo#23121118',
      '23121118'
    ]
  },
  {
    id: 'member-miguel',
    email: 'l23121135@morelia.tecnm.mx',
    controlNumber: '23121135',
    alternateInputs: ['23121135'],
    rbacRole: 'DEV_QA',
    validPasswords: [
      process.env.PARKFLOW_PASS_MIGUEL || 'PF-Miguel#23121135',
      '23121135'
    ]
  },
  {
    id: 'member-julio',
    email: 'l23121112@morelia.tecnm.mx',
    controlNumber: '23121112',
    alternateInputs: ['23121112'],
    rbacRole: 'DEVELOPER',
    validPasswords: [
      process.env.PARKFLOW_PASS_JULIO || 'PF-Julio#23121112',
      '23121112'
    ]
  },
  {
    id: 'member-luis',
    email: 'l24121432@morelia.tecnm.mx',
    controlNumber: '24120432',
    alternateInputs: ['l24120432@morelia.tecnm.mx', '24120432'],
    rbacRole: 'DEVELOPER',
    validPasswords: [
      process.env.PARKFLOW_PASS_LUIS || 'PF-Luis#24120432',
      '24120432'
    ]
  }
]

const STORE_NAME = 'parkflow-scrumban'
const STATE_KEY = 'board-state-v1'

const jsonResponse = (status: number, data: unknown) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
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
      const body = await req.json()

      // 1. Autenticación en servidor (RNF-02)
      if (body.action === 'LOGIN') {
        const rawIdentifier = String(body.identifier || '')
          .trim()
          .toLowerCase()
        const rawPassword = String(body.password || '').trim()

        const matched = OFFICIAL_ACCOUNTS.find(
          (acc) =>
            acc.email.toLowerCase() === rawIdentifier ||
            acc.controlNumber.toLowerCase() === rawIdentifier ||
            acc.alternateInputs.some((alt) => alt.toLowerCase() === rawIdentifier)
        )

        if (!matched) {
          return jsonResponse(401, {
            ok: false,
            message:
              'Correo o Número de Control no perteneciente al equipo oficial de PARK FLOW. Si eres evaluador o invitado usa el botón de Vista Evaluador (/guest).'
          })
        }

        if (!matched.validPasswords.includes(rawPassword)) {
          return jsonResponse(401, {
            ok: false,
            message:
              'Contraseña incorrecta para esta cuenta institucional @morelia.tecnm.mx.'
          })
        }

        return jsonResponse(200, {
          ok: true,
          memberId: matched.id,
          email: matched.email,
          rbacRole: matched.rbacRole
        })
      }

      // 2. Persistencia en Netlify Blobs con guardia RBAC en servidor
      if (body.action === 'SAVE_STATE') {
        const actorRole = String(body.actorRole || '')
        const actorEmail = String(body.actorEmail || '').toLowerCase()
        const isSprintMutation = Boolean(body.isSprintMutation)

        if (actorRole === 'GUEST_VIEWER') {
          return jsonResponse(403, {
            ok: false,
            message:
              'Bloqueo RBAC Servidor: El rol GUEST_VIEWER es estrictamente de solo lectura.'
          })
        }

        if (
          isSprintMutation &&
          (actorRole !== 'ADMIN_PO_SM' || actorEmail !== 'l221213339@morelia.tecnm.mx')
        ) {
          return jsonResponse(403, {
            ok: false,
            message:
              'Bloqueo RBAC Servidor: Únicamente Haziel Ruiz Zúñiga (l221213339@morelia.tecnm.mx — ADMIN_PO_SM) puede iniciar, editar o completar Sprints.'
          })
        }

        const store = getStore(STORE_NAME)
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
