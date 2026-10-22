export type Role =
  | 'ADMIN_PO_SM'
  | 'TECH_LEAD'
  | 'DEV_QA'
  | 'DEVELOPER'
  | 'GUEST_VIEWER'

export type ColumnId =
  | 'BACKLOG'
  | 'TO_DO'
  | 'IN_PROGRESS'
  | 'IN_REVIEW'
  | 'DONE'

export type SprintId = 'sprint-1' | 'sprint-2' | 'sprint-3' | null

export type ArchitecturalLayer = '/cv-service' | '/api-backend' | '/client-app'

export type ErsCategory =
  | 'Interfaz Usuario'
  | 'Interfaz Hardware'
  | 'Interfaz Software'
  | 'Comunicación'
  | 'Funcional'
  | 'Rendimiento'
  | 'Seguridad'
  | 'Usabilidad'
  | 'Disponibilidad'
  | 'Mantenibilidad'
  | 'Portabilidad'
  | 'Precisión IA'
  | 'Privacidad'

export interface TeamMember {
  id: string
  name: string
  controlNumber: string
  email: string
  alternateEmails?: string[]
  projectRole: string
  rbacRole: Role
  avatarInitials: string
  avatarColor: string
  permissionsSummary: string
}

export interface ErsRequirement {
  code: string
  category: ErsCategory
  name: string
  priority: 'Alta/Esencial' | 'Media/Deseado'
  criteria: string
  useCases?: string[]
}

export interface Epic {
  key: string // PF-5 .. PF-9
  moduleCode: string // EPIC-1 .. EPIC-5
  name: string
  description: string
  color: string
  ersCodes: string[]
  useCases: string[]
  layer: ArchitecturalLayer
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
}

export interface TaskComment {
  id: string
  authorId: string
  authorName: string
  authorRole: Role
  content: string
  createdAt: string
}

export interface Task {
  key: string // PF-10 .. PF-24
  epicKey: string // PF-5 .. PF-9
  title: string
  description: string
  ersCodes: string[]
  useCases: string[]
  assigneeId: string
  coAssigneeId?: string
  sprintId: SprintId // Scalar identifier: 'sprint-1' | 'sprint-2' | 'sprint-3' | null
  columnId: ColumnId
  githubBranch: string
  pullRequestUrl?: string
  storyPoints: number
  priority: 'Crítica' | 'Alta' | 'Media'
  layer: ArchitecturalLayer
  acceptanceCriteria: string[]
  subtasks: Subtask[]
  comments: TaskComment[]
  leadTimeDays?: number
  cycleTimeDays?: number
  updatedAt: string
}

export interface Sprint {
  id: 'sprint-1' | 'sprint-2' | 'sprint-3'
  name: string
  goal: string
  startDate: string
  endDate: string
  status: 'COMPLETED' | 'ACTIVE' | 'PLANNED'
  completedAt?: string
}

export interface ColumnDefinition {
  id: ColumnId
  title: string
  subtitle: string
  wipLimit: number | null
  accentColor: string
}

export interface AuditLogEntry {
  id: string
  timestamp: string
  actorName: string
  actorEmail: string
  actorRole: Role
  action: string
  taskKey?: string
  details: string
}

export interface ToastNotification {
  id: string
  type: 'error' | 'warning' | 'success' | 'info'
  title: string
  message: string
}
