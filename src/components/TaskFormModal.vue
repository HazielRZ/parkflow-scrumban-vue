<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  X,
  Plus,
  Trash2,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Save
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useScrumbanStore } from '@/stores/useScrumbanStore'
import type { ArchitecturalLayer, ColumnId, SprintId } from '@/types/scrumban'

const authStore = useAuthStore()
const scrumbanStore = useScrumbanStore()

const isEditMode = computed(() => Boolean(scrumbanStore.editingTaskKey))
const existingTask = computed(() =>
  scrumbanStore.editingTaskKey
    ? scrumbanStore.tasks.find((t) => t.key === scrumbanStore.editingTaskKey)
    : undefined
)

const displayKey = computed(() =>
  isEditMode.value && existingTask.value
    ? existingTask.value.key
    : scrumbanStore.getNextTaskKey()
)

const title = ref('')
const description = ref('')
const epicKey = ref('PF-5')
const layer = ref<ArchitecturalLayer>('/api-backend')
const assigneeId = ref('member-rodrigo')
const coAssigneeId = ref('')
const sprintId = ref<SprintId>('sprint-1')
const columnId = ref<ColumnId>('TO_DO')
const storyPoints = ref<number>(5)
const priority = ref<'Crítica' | 'Alta' | 'Media'>('Alta')
const githubBranch = ref('')
const pullRequestUrl = ref('')
const selectedErsCodes = ref<string[]>(['RNF-05'])
const selectedUseCases = ref<string[]>([])
const acceptanceCriteria = ref<string[]>([
  'Cumplir especificaciones del ERSIS2026 III sin regresiones.'
])
const newCriteriaText = ref('')

const allUseCases = ['CU-01', 'CU-02', 'CU-03', 'CU-04', 'CU-05']
const storyPointsOptions = [1, 2, 3, 5, 8, 13, 21]

const populateForm = () => {
  if (isEditMode.value && existingTask.value) {
    const t = existingTask.value
    title.value = t.title
    description.value = t.description
    epicKey.value = t.epicKey
    layer.value = t.layer
    assigneeId.value = t.assigneeId
    coAssigneeId.value = t.coAssigneeId || ''
    sprintId.value = t.sprintId
    columnId.value = t.columnId
    storyPoints.value = t.storyPoints
    priority.value = t.priority
    githubBranch.value = t.githubBranch
    pullRequestUrl.value = t.pullRequestUrl || ''
    selectedErsCodes.value = [...t.ersCodes]
    selectedUseCases.value = [...t.useCases]
    acceptanceCriteria.value = [...t.acceptanceCriteria]
  } else {
    const nextK = scrumbanStore.getNextTaskKey()
    title.value = ''
    description.value = ''
    epicKey.value = 'PF-5'
    layer.value = '/api-backend'
    assigneeId.value = authStore.currentUser.rbacRole === 'GUEST_VIEWER' ? 'member-haziel' : authStore.currentUser.id
    coAssigneeId.value = ''
    sprintId.value =
      scrumbanStore.selectedSprintFilter === 'ALL'
        ? scrumbanStore.activeSprint.id
        : scrumbanStore.selectedSprintFilter
    columnId.value = 'TO_DO'
    storyPoints.value = 5
    priority.value = 'Alta'
    githubBranch.value = `feature/${nextK}-nueva-funcionalidad`
    pullRequestUrl.value = ''
    selectedErsCodes.value = ['RNF-05']
    selectedUseCases.value = []
    acceptanceCriteria.value = [
      'Implementación validada contra criterios técnicos del ERSIS2026 III.'
    ]
  }
}

watch(
  () => scrumbanStore.isTaskFormModalOpen,
  (open) => {
    if (open) populateForm()
  }
)

// Auto-sugerir nombre de rama en modo creación al escribir el título
watch(title, (newTitle) => {
  if (!isEditMode.value) {
    const slug = newTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 30)
    githubBranch.value = `feature/${displayKey.value}-${slug || 'implementacion'}`
  }
})

const toggleErsCode = (code: string) => {
  if (selectedErsCodes.value.includes(code)) {
    if (selectedErsCodes.value.length > 1) {
      selectedErsCodes.value = selectedErsCodes.value.filter((c) => c !== code)
    }
  } else {
    selectedErsCodes.value.push(code)
  }
}

const toggleUseCase = (cu: string) => {
  if (selectedUseCases.value.includes(cu)) {
    selectedUseCases.value = selectedUseCases.value.filter((c) => c !== cu)
  } else {
    selectedUseCases.value.push(cu)
  }
}

const addCriterion = () => {
  const clean = newCriteriaText.value.trim()
  if (!clean) return
  acceptanceCriteria.value.push(clean)
  newCriteriaText.value = ''
}

const removeCriterion = (index: number) => {
  acceptanceCriteria.value.splice(index, 1)
}

const closeModal = () => {
  scrumbanStore.isTaskFormModalOpen = false
  scrumbanStore.editingTaskKey = null
}

const handleSubmit = () => {
  if (!title.value.trim()) return

  const payload = {
    title: title.value,
    description:
      description.value.trim() ||
      title.value.trim(),
    epicKey: epicKey.value,
    ersCodes: selectedErsCodes.value,
    useCases: selectedUseCases.value,
    assigneeId: assigneeId.value,
    coAssigneeId: coAssigneeId.value || undefined,
    sprintId: sprintId.value,
    columnId: columnId.value,
    githubBranch: githubBranch.value,
    pullRequestUrl: pullRequestUrl.value || undefined,
    storyPoints: storyPoints.value,
    priority: priority.value,
    layer: layer.value,
    acceptanceCriteria: acceptanceCriteria.value
  }

  if (isEditMode.value && existingTask.value) {
    scrumbanStore.updateTask(existingTask.value.key, payload)
  } else {
    scrumbanStore.createTask(payload)
  }
}
</script>

<template>
  <div
    v-if="scrumbanStore.isTaskFormModalOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm overflow-y-auto"
    @click.self="closeModal"
  >
    <div
      class="relative my-8 w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
    >
      <!-- Encabezado -->
      <div class="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
        <div class="flex items-center gap-3">
          <span
            class="rounded-lg bg-emerald-500/20 px-3 py-1 font-mono text-sm font-extrabold text-emerald-300 border border-emerald-500/40"
          >
            {{ displayKey }}
          </span>
          <div>
            <h2 class="text-base font-bold text-white">
              {{ isEditMode ? `Editar Historia / Tarea ${displayKey}` : `Crear Nueva Historia / Tarea (${displayKey})` }}
            </h2>
            <p class="text-xs text-slate-400">
              Trazabilidad obligatoria con Épicas (`PF-5` a `PF-9`), Requisitos `ERSIS2026 III` y rama GitHub
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="closeModal"
          class="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-white"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleSubmit" class="max-h-[78vh] overflow-y-auto p-6 space-y-5">
        <!-- Título y Descripción -->
        <div class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">
              Título de la Historia / Tarea Técnica *
            </label>
            <input
              v-model="title"
              type="text"
              required
              placeholder="Ej. Implementar caché de estados de cajones o calibración nocturna..."
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-300 mb-1">
              Descripción Técnica Detallada
            </label>
            <textarea
              v-model="description"
              rows="3"
              placeholder="Describe el alcance técnico, SLAs de latencia o restricciones aplicables..."
              class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Épica, Capa Arquitectónica, Sprint y Columna -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Épica (PF-5 a PF-9)
            </label>
            <select
              v-model="epicKey"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option v-for="ep in scrumbanStore.epics" :key="ep.key" :value="ep.key">
                {{ ep.key }} ({{ ep.moduleCode }}) — {{ ep.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Capa Modular (RNF-05)
            </label>
            <select
              v-model="layer"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-cyan-300 font-mono"
            >
              <option value="/cv-service">/cv-service (Visión IA)</option>
              <option value="/api-backend">/api-backend (FastAPI/DB)</option>
              <option value="/client-app">/client-app (PWA/Dashboard)</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Sprint Escalar Único
            </label>
            <select
              v-model="sprintId"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option :value="'sprint-1'">Sprint 1</option>
              <option :value="'sprint-2'">Sprint 2</option>
              <option :value="'sprint-3'">Sprint 3</option>
              <option :value="null">Backlog (Sin Sprint)</option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Columna Inicial
            </label>
            <select
              v-model="columnId"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option v-for="col in scrumbanStore.columns" :key="col.id" :value="col.id">
                {{ col.title }}
              </option>
            </select>
          </div>
        </div>

        <!-- Responsable, Co-responsable, Story Points y Prioridad -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Responsable Principal
            </label>
            <select
              v-model="assigneeId"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option
                v-for="m in authStore.members.filter((x) => x.rbacRole !== 'GUEST_VIEWER')"
                :key="m.id"
                :value="m.id"
              >
                {{ m.name }} ({{ m.rbacRole }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Co-Responsable (Opcional)
            </label>
            <select
              v-model="coAssigneeId"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option value="">Ninguno</option>
              <option
                v-for="m in authStore.members.filter(
                  (x) => x.rbacRole !== 'GUEST_VIEWER' && x.id !== assigneeId
                )"
                :key="m.id"
                :value="m.id"
              >
                {{ m.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Story Points (Fibonacci)
            </label>
            <select
              v-model.number="storyPoints"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs font-mono text-emerald-300"
            >
              <option v-for="sp in storyPointsOptions" :key="sp" :value="sp">
                {{ sp }} SP
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[11px] font-bold uppercase text-slate-400 mb-1">
              Prioridad
            </label>
            <select
              v-model="priority"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-white"
            >
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Media">Media</option>
            </select>
          </div>
        </div>

        <!-- Rama GitHub y Pull Request -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3.5">
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
              <GitBranch class="h-3.5 w-3.5 text-emerald-400" />
              Rama de GitHub (`feature/PF-XX-...`)
            </label>
            <input
              v-model="githubBranch"
              type="text"
              required
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-emerald-300"
            />
          </div>
          <div>
            <label class="block text-[11px] font-bold text-slate-300 mb-1">
              URL de Pull Request (Opcional)
            </label>
            <input
              v-model="pullRequestUrl"
              type="url"
              placeholder="https://github.com/HazielRZ/park-flow/pull/..."
              class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-cyan-300"
            />
          </div>
        </div>

        <!-- Selector de Requisitos del ERS (22 códigos oficiales) y Casos de Uso -->
        <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck class="h-4 w-4" />
              Requisitos del ERSIS2026 III Vinculados ({{ selectedErsCodes.length }} seleccionados)
            </label>
          </div>

          <div class="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
            <button
              v-for="req in scrumbanStore.ersRequirements"
              :key="req.code"
              type="button"
              @click="toggleErsCode(req.code)"
              class="rounded-lg border px-2 py-1 text-left transition text-[11px] font-mono"
              :class="
                selectedErsCodes.includes(req.code)
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-200 font-bold'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
              "
              :title="req.name"
            >
              {{ req.code }}
            </button>
          </div>

          <div class="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span class="text-[11px] font-semibold text-slate-400">Casos de Uso (CU-XX):</span>
            <button
              v-for="cu in allUseCases"
              :key="cu"
              type="button"
              @click="toggleUseCase(cu)"
              class="rounded-md border px-2 py-0.5 font-mono text-[11px] transition"
              :class="
                selectedUseCases.includes(cu)
                  ? 'border-purple-500 bg-purple-500/25 text-purple-200 font-bold'
                  : 'border-slate-800 bg-slate-900 text-slate-400'
              "
            >
              {{ cu }}
            </button>
          </div>
        </div>

        <!-- Criterios de Aceptación (DoD) -->
        <div class="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5">
          <label class="block text-xs font-bold text-slate-300">
            Criterios de Aceptación (Definition of Done)
          </label>
          <div class="space-y-1.5">
            <div
              v-for="(crit, idx) in acceptanceCriteria"
              :key="idx"
              class="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-200"
            >
              <div class="flex items-center gap-2">
                <CheckCircle2 class="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{{ crit }}</span>
              </div>
              <button
                type="button"
                @click="removeCriterion(idx)"
                class="text-slate-500 hover:text-rose-400"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div class="flex gap-2 pt-1">
            <input
              v-model="newCriteriaText"
              type="text"
              placeholder="Agregar nuevo criterio de aceptación..."
              @keydown.enter.prevent="addCriterion"
              class="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white"
            />
            <button
              type="button"
              @click="addCriterion"
              class="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-slate-700"
            >
              <Plus class="h-3.5 w-3.5" />
              Añadir
            </button>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
          <button
            type="button"
            @click="closeModal"
            class="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          >
            <Save class="h-4 w-4" />
            <span>{{ isEditMode ? `Guardar Cambios en ${displayKey}` : `Crear Tarea ${displayKey}` }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
