import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  COLUMNS_CONFIG,
  EPICS_SEED,
  ERS_REQUIREMENTS_SEED,
  SPRINTS_SEED,
  TASKS_SEED
} from '@/data/parkflowSeed'
import { useAuthStore } from '@/stores/useAuthStore'
import type {
  ArchitecturalLayer,
  AuditLogEntry,
  ColumnDefinition,
  ColumnId,
  Epic,
  ErsRequirement,
  Sprint,
  SprintId,
  Task,
  ToastNotification
} from '@/types/scrumban'

const STORAGE_TASKS_KEY = 'parkflow_scrumban_tasks_v1'
const STORAGE_SPRINTS_KEY = 'parkflow_scrumban_sprints_v1'
const STORAGE_ACTIVE_SPRINT_KEY = 'parkflow_scrumban_active_sprint_v1'
const STORAGE_AUDIT_KEY = 'parkflow_scrumban_audit_v1'
const BROADCAST_CHANNEL_NAME = 'parkflow_scrumban_sync'

export const useScrumbanStore = defineStore('scrumban', () => {
  const authStore = useAuthStore()

  const cloneSeedTasks = (): Task[] => JSON.parse(JSON.stringify(TASKS_SEED))
  const cloneSeedSprints = (): Sprint[] => JSON.parse(JSON.stringify(SPRINTS_SEED))

  const loadTasks = (): Task[] => {
    try {
      const raw = localStorage.getItem(STORAGE_TASKS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Task[]
        if (Array.isArray(parsed) && parsed.length >= 15) return parsed
      }
    } catch {
      // fallback to seed
    }
    return cloneSeedTasks()
  }

  const loadSprints = (): Sprint[] => {
    try {
      const raw = localStorage.getItem(STORAGE_SPRINTS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Sprint[]
        if (Array.isArray(parsed) && parsed.length === 3) return parsed
      }
    } catch {
      // fallback to seed
    }
    return cloneSeedSprints()
  }

  const loadSelectedSprint = (): 'sprint-1' | 'sprint-2' | 'sprint-3' | 'ALL' => {
    try {
      const saved = localStorage.getItem(STORAGE_ACTIVE_SPRINT_KEY)
      if (saved === 'sprint-1' || saved === 'sprint-2' || saved === 'sprint-3' || saved === 'ALL') {
        return saved
      }
    } catch {
      // ignore
    }
    return 'sprint-1'
  }

  const loadAuditLog = (): AuditLogEntry[] => {
    try {
      const raw = localStorage.getItem(STORAGE_AUDIT_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as AuditLogEntry[]
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'audit-init-1',
        timestamp: '2026-10-12T08:00:00-06:00',
        actorName: 'Haziel Ruiz Zúñiga',
        actorEmail: 'l221213339@morelia.tecnm.mx',
        actorRole: 'ADMIN_PO_SM',
        action: 'SPRINT_STARTED',
        details:
          'Sprint 1 iniciado con protección RBAC activa y límites WIP configurados (IN_PROGRESS <= 4, IN_REVIEW <= 3).'
      },
      {
        id: 'audit-init-2',
        timestamp: '2026-10-16T14:20:00-06:00',
        actorName: 'José Rodrigo Vargas Carrillo',
        actorEmail: 'l23121118@morelia.tecnm.mx',
        actorRole: 'TECH_LEAD',
        action: 'CODE_REVIEW_APPROVED',
        taskKey: 'PF-10',
        details: 'Aprobó Code Review de PF-10 (feature/PF-10-modular-architecture) -> Listo (DONE).'
      },
      {
        id: 'audit-init-3',
        timestamp: '2026-10-18T11:15:00-06:00',
        actorName: 'Miguel Ángel Cristal Bolaños',
        actorEmail: 'l23121135@morelia.tecnm.mx',
        actorRole: 'DEV_QA',
        action: 'QA_VALIDATED',
        taskKey: 'PF-11',
        details: 'Validó pruebas CI/CD y contenedores Docker de PF-11 -> Listo (DONE).'
      }
    ]
  }

  const tasks = ref<Task[]>(loadTasks())
  const sprints = ref<Sprint[]>(loadSprints())
  const epics = ref<Epic[]>(EPICS_SEED)
  const ersRequirements = ref<ErsRequirement[]>(ERS_REQUIREMENTS_SEED)
  const columns = ref<ColumnDefinition[]>(COLUMNS_CONFIG)
  const auditLog = ref<AuditLogEntry[]>(loadAuditLog())

  // Filters & active selections
  const selectedSprintFilter = ref<'sprint-1' | 'sprint-2' | 'sprint-3' | 'ALL'>(loadSelectedSprint())
  const selectedEpicFilter = ref<string>('ALL')
  const selectedLayerFilter = ref<ArchitecturalLayer | 'ALL'>('ALL')
  const selectedAssigneeFilter = ref<string>('ALL')
  const selectedErsFilter = ref<string>('ALL')
  const searchQuery = ref<string>('')

  // Admin WIP override toggle (available exclusively to Haziel - ADMIN_PO_SM)
  const adminWipOverrideEnabled = ref<boolean>(false)

  // Modal state
  const activeTaskModalKey = ref<string | null>(null)
  const isCompleteSprintModalOpen = ref<boolean>(false)

  // Toast notifications
  const toasts = ref<ToastNotification[]>([])

  // Cross-tab instant synchronization via BroadcastChannel
  let channel: BroadcastChannel | null = null
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME)
    channel.onmessage = (event) => {
      const data = event.data
      if (data?.type === 'SYNC_STATE') {
        tasks.value = data.tasks
        sprints.value = data.sprints
        auditLog.value = data.auditLog
      }
    }
  }

  const persistState = (broadcast = true) => {
    try {
      localStorage.setItem(STORAGE_TASKS_KEY, JSON.stringify(tasks.value))
      localStorage.setItem(STORAGE_SPRINTS_KEY, JSON.stringify(sprints.value))
      localStorage.setItem(STORAGE_ACTIVE_SPRINT_KEY, selectedSprintFilter.value)
      localStorage.setItem(STORAGE_AUDIT_KEY, JSON.stringify(auditLog.value))
      if (broadcast && channel) {
        channel.postMessage({
          type: 'SYNC_STATE',
          tasks: JSON.parse(JSON.stringify(tasks.value)),
          sprints: JSON.parse(JSON.stringify(sprints.value)),
          auditLog: JSON.parse(JSON.stringify(auditLog.value))
        })
      }
    } catch {
      // ignore localStorage quota errors
    }
  }

  const pushToast = (
    type: ToastNotification['type'],
    title: string,
    message: string,
    durationMs = 4500
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    toasts.value.push({ id, type, title, message })
    setTimeout(() => {
      dismissToast(id)
    }, durationMs)
  }

  const dismissToast = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const recordAudit = (action: string, details: string, taskKey?: string) => {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      actorName: authStore.currentUser.name,
      actorEmail: authStore.currentUser.email,
      actorRole: authStore.currentUser.rbacRole,
      action,
      taskKey,
      details
    }
    auditLog.value.unshift(entry)
    if (auditLog.value.length > 60) {
      auditLog.value = auditLog.value.slice(0, 60)
    }
  }

  // Computed active sprint object
  const activeSprint = computed<Sprint>(() => {
    return sprints.value.find((s) => s.status === 'ACTIVE') || sprints.value[0]
  })

  const currentViewedSprint = computed<Sprint | null>(() => {
    if (selectedSprintFilter.value === 'ALL') return null
    return sprints.value.find((s) => s.id === selectedSprintFilter.value) || activeSprint.value
  })

  // Filtered tasks for the board
  const filteredTasks = computed<Task[]>(() => {
    return tasks.value.filter((task) => {
      if (selectedSprintFilter.value !== 'ALL' && task.sprintId !== selectedSprintFilter.value) {
        return false
      }
      if (selectedEpicFilter.value !== 'ALL' && task.epicKey !== selectedEpicFilter.value) {
        return false
      }
      if (selectedLayerFilter.value !== 'ALL' && task.layer !== selectedLayerFilter.value) {
        return false
      }
      if (
        selectedAssigneeFilter.value !== 'ALL' &&
        task.assigneeId !== selectedAssigneeFilter.value &&
        task.coAssigneeId !== selectedAssigneeFilter.value
      ) {
        return false
      }
      if (
        selectedErsFilter.value !== 'ALL' &&
        !task.ersCodes.includes(selectedErsFilter.value) &&
        !task.useCases.includes(selectedErsFilter.value)
      ) {
        return false
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.trim().toLowerCase()
        const matchKey = task.key.toLowerCase().includes(q)
        const matchTitle = task.title.toLowerCase().includes(q)
        const matchBranch = task.githubBranch.toLowerCase().includes(q)
        const matchErs = task.ersCodes.some((c) => c.toLowerCase().includes(q))
        if (!matchKey && !matchTitle && !matchBranch && !matchErs) return false
      }
      return true
    })
  })

  const getTasksByColumn = (columnId: ColumnId): Task[] => {
    return filteredTasks.value.filter((t) => t.columnId === columnId)
  }

  // Global count in column for the currently viewed sprint (for strict WIP validation)
  const getWipCountForColumn = (columnId: ColumnId, sprintScope?: SprintId): number => {
    const scope =
      sprintScope !== undefined
        ? sprintScope
        : selectedSprintFilter.value === 'ALL'
          ? activeSprint.value.id
          : selectedSprintFilter.value
    return tasks.value.filter((t) => t.columnId === columnId && t.sprintId === scope).length
  }

  const getColumnWipLimit = (columnId: ColumnId): number | null => {
    const col = columns.value.find((c) => c.id === columnId)
    return col?.wipLimit ?? null
  }

  const isColumnAtOrOverWip = (columnId: ColumnId): boolean => {
    const limit = getColumnWipLimit(columnId)
    if (limit === null) return false
    return getWipCountForColumn(columnId) >= limit
  }

  /**
   * Regla 5.1 de AGENTS.md:
   * - GUEST_VIEWER: 0 permisos de mutación
   * - DEVELOPER: Solo actualiza progreso de sus tareas hasta IN_REVIEW; no puede auto-aprobar Code Review (pasar a DONE).
   * - IN_PROGRESS: WIP Máximo = 4 tareas (salvo override explícito de ADMIN_PO_SM).
   * - IN_REVIEW: WIP Máximo = 3 tareas y requiere rama GitHub (feature/PF-XX-...) o PR.
   * - DONE: Solo ADMIN_PO_SM, TECH_LEAD o DEV_QA pueden mover una tarjeta de IN_REVIEW a DONE.
   */
  const moveTask = (
    taskKey: string,
    targetColumn: ColumnId,
    forceAdminOverride = false
  ): boolean => {
    if (authStore.isReadOnly) {
      pushToast(
        'error',
        'Modo Solo Lectura (GUEST_VIEWER)',
        'La vista de Evaluador / Invitado no permite mover tarjetas ni modificar el tablero.'
      )
      return false
    }

    const taskIndex = tasks.value.findIndex((t) => t.key === taskKey)
    if (taskIndex === -1) return false

    const task = tasks.value[taskIndex]
    const sourceColumn = task.columnId
    if (sourceColumn === targetColumn) return true

    const role = authStore.currentUser.rbacRole
    const userId = authStore.currentUser.id

    // Regla para DEVELOPER: solo puede mover tareas donde participa y no puede pasar a DONE
    if (role === 'DEVELOPER') {
      const isAssignedToDev = task.assigneeId === userId || task.coAssigneeId === userId
      if (!isAssignedToDev) {
        pushToast(
          'warning',
          'Permiso RBAC Restringido (DEVELOPER)',
          `Solo puedes mover tareas asignadas a tu perfil. ${task.key} está asignada a otro integrante.`
        )
        return false
      }
      if (targetColumn === 'DONE') {
        pushToast(
          'error',
          'Code Review & QA Requerido (RBAC)',
          'Un Developer no puede auto-aprobar Code Review. Solicita a Haziel (PO/SM), Rodrigo (Tech Lead) o Miguel (DevOps/QA) mover la tarea a Listo (DONE).'
        )
        return false
      }
    }

    // Regla para pasar a DONE: Solo ADMIN_PO_SM, TECH_LEAD o DEV_QA
    if (targetColumn === 'DONE') {
      if (!['ADMIN_PO_SM', 'TECH_LEAD', 'DEV_QA'].includes(role)) {
        pushToast(
          'error',
          'Transición a DONE Bloqueada (RBAC)',
          'Solo ADMIN_PO_SM, TECH_LEAD o DEV_QA pueden validar criterios ERS y mover tareas a Listo.'
        )
        return false
      }
    }

    // Regla para entrar a IN_REVIEW: requiere rama feature/PF-XX-...
    if (targetColumn === 'IN_REVIEW') {
      if (!task.githubBranch || !task.githubBranch.trim().startsWith('feature/PF-')) {
        pushToast(
          'error',
          'Rama GitHub Requerida para Revisión',
          `La tarea ${task.key} requiere una rama válida con formato feature/${task.key}-... antes de pasar a En revisión.`
        )
        return false
      }
    }

    // Validación estricta de Límites WIP (IN_PROGRESS <= 4, IN_REVIEW <= 3)
    const wipLimit = getColumnWipLimit(targetColumn)
    if (wipLimit !== null) {
      const currentCount = getWipCountForColumn(targetColumn, task.sprintId)
      if (currentCount >= wipLimit) {
        const canOverride =
          role === 'ADMIN_PO_SM' && (adminWipOverrideEnabled.value || forceAdminOverride)
        if (!canOverride) {
          const colTitle =
            columns.value.find((c) => c.id === targetColumn)?.title || targetColumn
          pushToast(
            'error',
            `Límite WIP Alcanzado en "${colTitle}" (${currentCount}/${wipLimit})`,
            role === 'ADMIN_PO_SM'
              ? `El límite estricto Scrumban es de ${wipLimit} tareas. Como ADMIN_PO_SM puedes activar "Override WIP" en la barra superior si es urgente.`
              : `El límite estricto Scrumban para "${colTitle}" es de máximo ${wipLimit} tareas activas. Termina o revisa una tarea antes de iniciar otra.`
          )
          return false
        } else {
          pushToast(
            'warning',
            `Override WIP Aplicado por ADMIN_PO_SM`,
            `Haziel Ruiz Zúñiga autorizó exceder temporalmente el límite WIP (${ currentCount + 1 }/${wipLimit}) en ${targetColumn}.`
          )
        }
      }
    }

    // Actualización optimista (0 ms latencia visual)
    task.columnId = targetColumn
    task.updatedAt = new Date().toISOString()
    if (targetColumn === 'DONE' && !task.leadTimeDays) {
      task.leadTimeDays = 3.2
      task.cycleTimeDays = 1.9
    }

    recordAudit(
      'TASK_MOVED',
      `Movió ${task.key} de ${sourceColumn} a ${targetColumn} (Sprint: ${task.sprintId ?? 'Backlog'}).`,
      task.key
    )
    persistState(true)

    pushToast(
      'success',
      `${task.key} -> ${columns.value.find((c) => c.id === targetColumn)?.title}`,
      `Estado actualizado instantáneamente (${task.githubBranch}).`,
      2600
    )
    return true
  }

  /**
   * Asignar o cambiar el Sprint escalar único de una tarea ('sprint-1' | 'sprint-2' | 'sprint-3' | null)
   * Impide etiquetas repetidas como "SCRUM Sprint 1, SCRUM Sprint 1"
   */
  const assignTaskToSprint = (taskKey: string, sprintId: SprintId): boolean => {
    if (authStore.isReadOnly) {
      pushToast(
        'error',
        'Modo Solo Lectura',
        'No tienes permisos para reasignar tareas de Sprint.'
      )
      return false
    }
    if (!['ADMIN_PO_SM', 'TECH_LEAD'].includes(authStore.currentUser.rbacRole)) {
      pushToast(
        'error',
        'Permiso RBAC Requerido',
        'Solo Haziel (PO/SM) o Rodrigo (Tech Lead) pueden reasignar el Sprint de una historia.'
      )
      return false
    }

    const task = tasks.value.find((t) => t.key === taskKey)
    if (!task) return false

    task.sprintId = sprintId
    if (sprintId && task.columnId === 'BACKLOG') {
      task.columnId = 'TO_DO'
    } else if (!sprintId) {
      task.columnId = 'BACKLOG'
    }
    task.updatedAt = new Date().toISOString()

    recordAudit(
      'SPRINT_ASSIGNED',
      `Asignó ${task.key} de forma única a ${sprintId ?? 'Backlog'}.`,
      task.key
    )
    persistState(true)
    pushToast(
      'info',
      `Sprint actualizado en ${task.key}`,
      `Asignado escalarmente a ${sprintId ? sprintId.toUpperCase() : 'Product Backlog'}.`
    )
    return true
  }

  /**
   * Regla 5.2 de AGENTS.md: Protección de Sprints (Anti-Cierre Accidental)
   * Únicamente Haziel Ruiz Zúñiga (l221213339@morelia.tecnm.mx - ADMIN_PO_SM) puede
   * ejecutar startSprint(), completeSprint() o updateSprint().
   */
  const startSprint = (sprintId: 'sprint-1' | 'sprint-2' | 'sprint-3'): boolean => {
    if (authStore.currentUser.rbacRole !== 'ADMIN_PO_SM') {
      pushToast(
        'error',
        'Acción Bloqueada por RBAC',
        'Únicamente Haziel Ruiz Zúñiga (ADMIN_PO_SM) tiene autorización para iniciar Sprints.'
      )
      return false
    }

    const target = sprints.value.find((s) => s.id === sprintId)
    if (!target) return false

    sprints.value.forEach((s) => {
      if (s.status === 'ACTIVE' && s.id !== sprintId) {
        s.status = 'COMPLETED'
      }
    })
    target.status = 'ACTIVE'
    selectedSprintFilter.value = sprintId

    // Pasar tareas en BACKLOG de este sprint a TO_DO
    tasks.value.forEach((t) => {
      if (t.sprintId === sprintId && t.columnId === 'BACKLOG') {
        t.columnId = 'TO_DO'
      }
    })

    recordAudit('SPRINT_STARTED', `Haziel (ADMIN_PO_SM) inició oficialmente ${target.name}.`)
    persistState(true)
    pushToast('success', 'Sprint Iniciado', `${target.name} ahora está ACTIVO.`)
    return true
  }

  const completeSprint = (sprintId: 'sprint-1' | 'sprint-2' | 'sprint-3'): boolean => {
    if (authStore.currentUser.rbacRole !== 'ADMIN_PO_SM') {
      pushToast(
        'error',
        'Bloqueo Anti-Cierre Accidental (RBAC)',
        'Permiso denegado: Solo Haziel Ruiz Zúñiga (l221213339@morelia.tecnm.mx — ADMIN_PO_SM) puede completar o cerrar Sprints.'
      )
      return false
    }

    const currentSprint = sprints.value.find((s) => s.id === sprintId)
    if (!currentSprint) return false

    const nextSprintId: SprintId =
      sprintId === 'sprint-1'
        ? 'sprint-2'
        : sprintId === 'sprint-2'
          ? 'sprint-3'
          : null

    const sprintTasks = tasks.value.filter((t) => t.sprintId === sprintId)
    const completedTasks = sprintTasks.filter((t) => t.columnId === 'DONE')
    const pendingTasks = sprintTasks.filter((t) => t.columnId !== 'DONE')

    // Reasignar escalarmente tareas pendientes al siguiente Sprint sin duplicar etiquetas
    pendingTasks.forEach((t) => {
      if (nextSprintId) {
        t.sprintId = nextSprintId
        if (t.columnId === 'BACKLOG') {
          t.columnId = 'TO_DO'
        }
      }
      t.updatedAt = new Date().toISOString()
    })

    currentSprint.status = 'COMPLETED'
    currentSprint.completedAt = new Date().toISOString()

    if (nextSprintId) {
      const nextSprint = sprints.value.find((s) => s.id === nextSprintId)
      if (nextSprint) {
        nextSprint.status = 'ACTIVE'
        // Activar las tareas del nuevo Sprint en TO_DO si estaban en BACKLOG
        tasks.value.forEach((t) => {
          if (t.sprintId === nextSprintId && t.columnId === 'BACKLOG') {
            t.columnId = 'TO_DO'
          }
        })
      }
      selectedSprintFilter.value = nextSprintId
    }

    isCompleteSprintModalOpen.value = false

    recordAudit(
      'SPRINT_COMPLETED',
      `Haziel (ADMIN_PO_SM) completó ${currentSprint.name}. Completadas: ${completedTasks.length}, Transferidas a ${nextSprintId ?? 'Backlog'}: ${pendingTasks.length}.`
    )
    persistState(true)

    pushToast(
      'success',
      `${currentSprint.name.split('—')[0].trim()} Completado`,
      `${completedTasks.length} tareas cerradas en DONE y ${pendingTasks.length} tareas transferidas limpiamente a ${nextSprintId ? nextSprintId.toUpperCase() : 'Backlog'}.`
    )
    return true
  }

  const updateSprint = (
    sprintId: 'sprint-1' | 'sprint-2' | 'sprint-3',
    payload: Partial<Pick<Sprint, 'name' | 'goal' | 'startDate' | 'endDate'>>
  ): boolean => {
    if (authStore.currentUser.rbacRole !== 'ADMIN_PO_SM') {
      pushToast(
        'error',
        'Permiso Denegado (RBAC)',
        'Solo Haziel Ruiz Zúñiga (ADMIN_PO_SM) puede editar la configuración de los Sprints.'
      )
      return false
    }

    const s = sprints.value.find((sp) => sp.id === sprintId)
    if (!s) return false

    Object.assign(s, payload)
    recordAudit('SPRINT_UPDATED', `Actualizó metadatos de ${s.name}.`)
    persistState(true)
    pushToast('success', 'Sprint Actualizado', 'Los cambios del Sprint fueron guardados.')
    return true
  }

  const toggleSubtask = (taskKey: string, subtaskId: string) => {
    if (authStore.isReadOnly) {
      pushToast(
        'error',
        'Modo Solo Lectura',
        'En modo Evaluador / Invitado no se pueden marcar subtareas.'
      )
      return
    }
    const task = tasks.value.find((t) => t.key === taskKey)
    if (!task) return
    const sub = task.subtasks.find((s) => s.id === subtaskId)
    if (!sub) return
    sub.completed = !sub.completed
    task.updatedAt = new Date().toISOString()
    recordAudit(
      'SUBTASK_TOGGLED',
      `${sub.completed ? 'Completó' : 'Reabrió'} subtarea "${sub.title}" en ${task.key}.`,
      task.key
    )
    persistState(true)
  }

  const updateTaskGitInfo = (
    taskKey: string,
    githubBranch: string,
    pullRequestUrl?: string
  ): boolean => {
    if (authStore.isReadOnly) {
      pushToast('error', 'Modo Solo Lectura', 'No puedes modificar ramas ni PRs en modo Invitado.')
      return false
    }
    const task = tasks.value.find((t) => t.key === taskKey)
    if (!task) return false
    task.githubBranch = githubBranch.trim()
    task.pullRequestUrl = pullRequestUrl?.trim() || undefined
    task.updatedAt = new Date().toISOString()
    recordAudit(
      'GIT_LINK_UPDATED',
      `Vinculó rama ${task.githubBranch} ${task.pullRequestUrl ? `y PR ${task.pullRequestUrl}` : ''} en ${task.key}.`,
      task.key
    )
    persistState(true)
    pushToast('success', 'Vínculo GitHub Actualizado', `Rama y PR guardados en ${task.key}.`)
    return true
  }

  const addComment = (taskKey: string, content: string): boolean => {
    if (authStore.isReadOnly) {
      pushToast(
        'error',
        'Modo Solo Lectura',
        'La vista de Evaluador / Invitado es estrictamente de lectura.'
      )
      return false
    }
    const trimmed = content.trim()
    if (!trimmed) return false
    const task = tasks.value.find((t) => t.key === taskKey)
    if (!task) return false

    task.comments.push({
      id: `comment-${Date.now()}`,
      authorId: authStore.currentUser.id,
      authorName: authStore.currentUser.name,
      authorRole: authStore.currentUser.rbacRole,
      content: trimmed,
      createdAt: new Date().toISOString()
    })
    task.updatedAt = new Date().toISOString()
    recordAudit('COMMENT_ADDED', `Comentó en ${task.key}: "${trimmed.slice(0, 50)}..."`, task.key)
    persistState(true)
    return true
  }

  const resetToOfficialSeed = () => {
    if (authStore.isReadOnly) {
      pushToast(
        'error',
        'Modo Solo Lectura',
        'Cambia a un rol del equipo para restaurar los datos semilla.'
      )
      return
    }
    tasks.value = cloneSeedTasks()
    sprints.value = cloneSeedSprints()
    selectedSprintFilter.value = 'sprint-1'
    selectedEpicFilter.value = 'ALL'
    selectedLayerFilter.value = 'ALL'
    selectedAssigneeFilter.value = 'ALL'
    selectedErsFilter.value = 'ALL'
    searchQuery.value = ''
    recordAudit(
      'SEED_RESTORED',
      'Restauró los datos semilla oficiales de PARK FLOW (PF-5 a PF-24 y ERSIS2026 III).'
    )
    persistState(true)
    pushToast(
      'info',
      'Datos Semilla Restaurados',
      'El tablero volvió al estado inicial oficial de PARK FLOW (PF-5 a PF-24).'
    )
  }

  // Metrics for header & dashboard
  const boardMetrics = computed(() => {
    const scopeTasks = filteredTasks.value
    const totalTasks = scopeTasks.length
    const doneTasks = scopeTasks.filter((t) => t.columnId === 'DONE').length
    const inProgressTasks = scopeTasks.filter((t) => t.columnId === 'IN_PROGRESS').length
    const inReviewTasks = scopeTasks.filter((t) => t.columnId === 'IN_REVIEW').length
    const totalPoints = scopeTasks.reduce((acc, t) => acc + t.storyPoints, 0)
    const donePoints = scopeTasks
      .filter((t) => t.columnId === 'DONE')
      .reduce((acc, t) => acc + t.storyPoints, 0)

    const tasksWithLead = tasks.value.filter((t) => typeof t.leadTimeDays === 'number')
    const avgLeadTime =
      tasksWithLead.length > 0
        ? (
            tasksWithLead.reduce((sum, t) => sum + (t.leadTimeDays || 0), 0) /
            tasksWithLead.length
          ).toFixed(1)
        : '2.8'
    const avgCycleTime =
      tasksWithLead.length > 0
        ? (
            tasksWithLead.reduce((sum, t) => sum + (t.cycleTimeDays || 0), 0) /
            tasksWithLead.length
          ).toFixed(1)
        : '1.8'

    return {
      totalTasks,
      doneTasks,
      inProgressTasks,
      inReviewTasks,
      totalPoints,
      donePoints,
      progressPercent: totalPoints > 0 ? Math.round((donePoints / totalPoints) * 100) : 0,
      avgLeadTime,
      avgCycleTime
    }
  })

  const getEpicByKey = (epicKey: string): Epic | undefined => {
    return epics.value.find((e) => e.key === epicKey)
  }

  const getErsByCode = (code: string): ErsRequirement | undefined => {
    return ersRequirements.value.find((r) => r.code === code)
  }

  return {
    tasks,
    sprints,
    epics,
    ersRequirements,
    columns,
    auditLog,
    selectedSprintFilter,
    selectedEpicFilter,
    selectedLayerFilter,
    selectedAssigneeFilter,
    selectedErsFilter,
    searchQuery,
    adminWipOverrideEnabled,
    activeTaskModalKey,
    isCompleteSprintModalOpen,
    toasts,
    activeSprint,
    currentViewedSprint,
    filteredTasks,
    boardMetrics,
    getTasksByColumn,
    getWipCountForColumn,
    getColumnWipLimit,
    isColumnAtOrOverWip,
    moveTask,
    assignTaskToSprint,
    startSprint,
    completeSprint,
    updateSprint,
    toggleSubtask,
    updateTaskGitInfo,
    addComment,
    resetToOfficialSeed,
    pushToast,
    dismissToast,
    getEpicByKey,
    getErsByCode
  }
})
