<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  X,
  GitBranch,
  CheckSquare,
  Square,
  ShieldCheck,
  ExternalLink,
  MessageSquare,
  Send,
  Layers,
  CheckCircle2,
  Lock
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useScrumbanStore } from '@/stores/useScrumbanStore'
import type { ColumnId, SprintId } from '@/types/scrumban'

const authStore = useAuthStore()
const scrumbanStore = useScrumbanStore()

const task = computed(() =>
  scrumbanStore.tasks.find((t) => t.key === scrumbanStore.activeTaskModalKey)
)

const epic = computed(() =>
  task.value ? scrumbanStore.getEpicByKey(task.value.epicKey) : undefined
)
const assignee = computed(() =>
  task.value ? authStore.getMemberById(task.value.assigneeId) : undefined
)
const coAssignee = computed(() =>
  task.value ? authStore.getMemberById(task.value.coAssigneeId) : undefined
)

const branchInput = ref('')
const prInput = ref('')
const commentInput = ref('')

watch(
  task,
  (newTask) => {
    if (newTask) {
      branchInput.value = newTask.githubBranch
      prInput.value = newTask.pullRequestUrl || ''
    }
  },
  { immediate: true }
)

const closeModal = () => {
  scrumbanStore.activeTaskModalKey = null
}

const handleColumnChange = (colId: ColumnId) => {
  if (!task.value) return
  scrumbanStore.moveTask(task.value.key, colId)
}

const handleSprintChange = (event: Event) => {
  if (!task.value) return
  const val = (event.target as HTMLSelectElement).value
  const parsed: SprintId =
    val === 'sprint-1' || val === 'sprint-2' || val === 'sprint-3' ? val : null
  scrumbanStore.assignTaskToSprint(task.value.key, parsed)
}

const handleSaveGit = () => {
  if (!task.value) return
  scrumbanStore.updateTaskGitInfo(task.value.key, branchInput.value, prInput.value)
}

const handleSendComment = () => {
  if (!task.value || !commentInput.value.trim()) return
  const ok = scrumbanStore.addComment(task.value.key, commentInput.value)
  if (ok) {
    commentInput.value = ''
  }
}
</script>

<template>
  <div
    v-if="task"
    class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm overflow-y-auto"
    @click.self="closeModal"
  >
    <div
      class="relative my-8 w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden"
    >
      <!-- Encabezado del Modal -->
      <div class="flex items-start justify-between gap-4 border-b border-slate-800 bg-slate-950/70 px-6 py-4">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-1.5">
            <span
              class="rounded-md bg-emerald-500/20 px-2.5 py-0.5 font-mono text-xs font-extrabold text-emerald-300 border border-emerald-500/40"
            >
              {{ task.key }}
            </span>
            <span
              class="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs font-semibold text-cyan-300"
            >
              {{ task.epicKey }} ({{ epic?.moduleCode }} — {{ epic?.name }})
            </span>
            <span
              class="rounded-md bg-slate-800 px-2 py-0.5 font-mono text-xs text-amber-300"
            >
              {{ task.layer }}
            </span>
            <span
              class="rounded-full bg-slate-800 px-2.5 py-0.5 font-mono text-xs font-bold text-white"
            >
              {{ task.storyPoints }} Story Points
            </span>
          </div>
          <h2 class="text-lg font-bold text-white leading-snug">
            {{ task.title }}
          </h2>
        </div>

        <button
          type="button"
          @click="closeModal"
          class="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 hover:text-white"
        >
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Cuerpo del Modal -->
      <div class="max-h-[78vh] overflow-y-auto p-6 space-y-6">
        <!-- Barra de estado de Columna Scrumban y Sprint Escalar -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Estado en Tablero Scrumban (Validación WIP &amp; RBAC):
            </label>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="col in scrumbanStore.columns"
                :key="col.id"
                type="button"
                :disabled="authStore.isReadOnly"
                @click="handleColumnChange(col.id)"
                class="rounded-lg px-2.5 py-1.5 text-xs font-semibold transition border"
                :class="
                  task.columnId === col.id
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                    : authStore.isReadOnly
                      ? 'bg-slate-900 text-slate-500 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-emerald-500/50 hover:text-white'
                "
              >
                {{ col.title }}
              </button>
            </div>
          </div>

          <div>
            <label class="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Asignación Única de Sprint (Escalar Anti-Duplicados):
            </label>
            <div class="flex items-center gap-2">
              <Layers class="h-4 w-4 text-cyan-400 shrink-0" />
              <select
                :value="task.sprintId ?? ''"
                :disabled="authStore.isReadOnly || !authStore.canCreateOrEditTasks"
                @change="handleSprintChange"
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                <option value="sprint-1">Sprint 1 (Semanas 1 - 2)</option>
                <option value="sprint-2">Sprint 2 (Semanas 3 - 4)</option>
                <option value="sprint-3">Sprint 3 (Semanas 5 - 6)</option>
                <option value="">Sin Sprint (Product Backlog)</option>
              </select>
            </div>
            <p class="mt-1 text-[10px] text-slate-400">
              Identificador escalar único: <code>{{ task.sprintId ?? 'null' }}</code>
            </p>
          </div>
        </div>

        <!-- Descripción y Responsables -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="md:col-span-2 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Descripción Técnica
            </h3>
            <p class="text-xs leading-relaxed text-slate-200">
              {{ task.description }}
            </p>

            <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2">
              Criterios de Aceptación (DoD)
            </h4>
            <ul class="space-y-1.5">
              <li
                v-for="(crit, i) in task.acceptanceCriteria"
                :key="i"
                class="flex items-start gap-2 text-xs text-slate-300"
              >
                <CheckCircle2 class="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{{ crit }}</span>
              </li>
            </ul>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">
              Responsable(s)
            </h3>
            <div v-if="assignee" class="flex items-center gap-2.5">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                :class="assignee.avatarColor"
              >
                {{ assignee.avatarInitials }}
              </div>
              <div>
                <p class="text-xs font-semibold text-white">{{ assignee.name }}</p>
                <p class="font-mono text-[10px] text-slate-400">{{ assignee.email }}</p>
                <p class="text-[10px] text-emerald-400">{{ assignee.projectRole }}</p>
              </div>
            </div>

            <div v-if="coAssignee" class="flex items-center gap-2.5 pt-2 border-t border-slate-800">
              <div
                class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                :class="coAssignee.avatarColor"
              >
                {{ coAssignee.avatarInitials }}
              </div>
              <div>
                <p class="text-xs font-semibold text-white">{{ coAssignee.name }}</p>
                <p class="font-mono text-[10px] text-slate-400">{{ coAssignee.email }}</p>
                <p class="text-[10px] text-cyan-400">Co-Responsable</p>
              </div>
            </div>

            <div class="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <p><strong>Prioridad:</strong> {{ task.priority }}</p>
              <p v-if="task.leadTimeDays">
                <strong>Lead Time:</strong> {{ task.leadTimeDays }} días
              </p>
              <p v-if="task.cycleTimeDays">
                <strong>Cycle Time:</strong> {{ task.cycleTimeDays }} días
              </p>
            </div>
          </div>
        </div>

        <!-- Trazabilidad con Requisitos del ERS (ERSIS2026 III) -->
        <div class="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck class="h-4 w-4" />
              Trazabilidad Directa con Requisitos del ERS (ERSIS2026 III)
            </h3>
            <div v-if="task.useCases.length" class="flex items-center gap-1">
              <span class="text-[11px] text-slate-400">Casos de Uso:</span>
              <span
                v-for="cu in task.useCases"
                :key="cu"
                class="rounded bg-purple-500/20 px-2 py-0.5 font-mono text-[11px] font-bold text-purple-300 border border-purple-500/40"
              >
                {{ cu }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div
              v-for="code in task.ersCodes"
              :key="code"
              class="rounded-lg border border-slate-800 bg-slate-900 p-3"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="font-mono text-xs font-extrabold text-emerald-300">
                  {{ code }}
                </span>
                <span class="text-[10px] font-semibold text-slate-400">
                  {{ scrumbanStore.getErsByCode(code)?.category }} •
                  {{ scrumbanStore.getErsByCode(code)?.priority }}
                </span>
              </div>
              <p class="text-xs font-semibold text-white">
                {{ scrumbanStore.getErsByCode(code)?.name }}
              </p>
              <p class="mt-1 text-[11px] text-slate-400">
                {{ scrumbanStore.getErsByCode(code)?.criteria }}
              </p>
            </div>
          </div>
        </div>

        <!-- Subtareas Interactivas y Vínculo con GitHub -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- Subtareas -->
          <div class="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3">
              Subtareas Técnicas ({{ task.subtasks.filter((s) => s.completed).length }}/{{
                task.subtasks.length
              }})
            </h3>
            <div class="space-y-2">
              <button
                v-for="sub in task.subtasks"
                :key="sub.id"
                type="button"
                :disabled="authStore.isReadOnly"
                @click="scrumbanStore.toggleSubtask(task.key, sub.id)"
                class="flex w-full items-center gap-2.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-left text-xs transition hover:border-slate-700 disabled:cursor-not-allowed"
              >
                <CheckSquare
                  v-if="sub.completed"
                  class="h-4 w-4 text-emerald-400 shrink-0"
                />
                <Square v-else class="h-4 w-4 text-slate-500 shrink-0" />
                <span
                  :class="
                    sub.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  "
                >
                  {{ sub.title }}
                </span>
              </button>
            </div>
          </div>

          <!-- Vínculo GitHub Branch & Pull Request -->
          <div class="rounded-xl border border-slate-800 bg-slate-950/50 p-4 space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <GitBranch class="h-4 w-4 text-emerald-400" />
              Rama GitHub y Pull Request (Requerido para IN_REVIEW)
            </h3>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">
                Rama asociada (<code>feature/PF-XX-...</code>):
              </label>
              <input
                v-model="branchInput"
                :disabled="authStore.isReadOnly"
                type="text"
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-emerald-300 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div>
              <label class="block text-[11px] text-slate-400 mb-1">
                URL del Pull Request en GitHub:
              </label>
              <input
                v-model="prInput"
                :disabled="authStore.isReadOnly"
                type="url"
                placeholder="https://github.com/HazielRZ/park-flow/pull/..."
                class="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 font-mono text-xs text-cyan-300 focus:border-emerald-500 focus:outline-none disabled:opacity-60"
              />
            </div>
            <div class="flex items-center justify-between pt-1">
              <a
                v-if="task.pullRequestUrl"
                :href="task.pullRequestUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:underline"
              >
                Abrir PR en GitHub <ExternalLink class="h-3.5 w-3.5" />
              </a>
              <span v-else class="text-[11px] text-slate-500">Sin PR vinculado aún</span>

              <button
                v-if="!authStore.isReadOnly"
                type="button"
                @click="handleSaveGit"
                class="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
              >
                Guardar Vínculo Git
              </button>
            </div>
          </div>
        </div>

        <!-- Comentarios y Bitácora de Revisión -->
        <div class="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
            <MessageSquare class="h-4 w-4 text-cyan-400" />
            Comentarios Técnicos y Revisión QA ({{ task.comments.length }})
          </h3>

          <div v-if="task.comments.length > 0" class="space-y-2.5 mb-4">
            <div
              v-for="c in task.comments"
              :key="c.id"
              class="rounded-lg border border-slate-800 bg-slate-900 p-3"
            >
              <div class="flex items-center justify-between text-[11px] mb-1">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-white">{{ c.authorName }}</span>
                  <span class="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300">
                    {{ c.authorRole }}
                  </span>
                </div>
                <span class="text-slate-500">
                  {{ new Date(c.createdAt).toLocaleString('es-MX') }}
                </span>
              </div>
              <p class="text-xs text-slate-300">{{ c.content }}</p>
            </div>
          </div>
          <p v-else class="text-xs text-slate-500 mb-3">
            No hay comentarios registrados en esta tarea.
          </p>

          <form
            v-if="!authStore.isReadOnly"
            @submit.prevent="handleSendComment"
            class="flex gap-2"
          >
            <input
              v-model="commentInput"
              type="text"
              placeholder="Registrar nota técnica, resultado de prueba QA o comentario de Code Review..."
              class="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              class="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500"
            >
              <Send class="h-3.5 w-3.5" />
              Comentar
            </button>
          </form>
          <div
            v-else
            class="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-950/30 px-3 py-2 text-xs text-rose-200"
          >
            <Lock class="h-4 w-4 text-rose-400" />
            <span>Modo Evaluador / Invitado (`Read-Only`): Comentarios y ediciones deshabilitados.</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
