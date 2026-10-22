<script setup lang="ts">
import { computed } from 'vue'
import {
  GitBranch,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  MessageSquare
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useScrumbanStore } from '@/stores/useScrumbanStore'
import type { ColumnId, Task } from '@/types/scrumban'

const props = defineProps<{
  task: Task
}>()

const authStore = useAuthStore()
const scrumbanStore = useScrumbanStore()

const columnOrder: ColumnId[] = ['BACKLOG', 'TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE']

const epic = computed(() => scrumbanStore.getEpicByKey(props.task.epicKey))
const assignee = computed(() => authStore.getMemberById(props.task.assigneeId))
const coAssignee = computed(() => authStore.getMemberById(props.task.coAssigneeId))

const completedSubtasksCount = computed(
  () => props.task.subtasks.filter((s) => s.completed).length
)

const prevColumn = computed<ColumnId | null>(() => {
  const idx = columnOrder.indexOf(props.task.columnId)
  return idx > 0 ? columnOrder[idx - 1] : null
})

const nextColumn = computed<ColumnId | null>(() => {
  const idx = columnOrder.indexOf(props.task.columnId)
  return idx >= 0 && idx < columnOrder.length - 1 ? columnOrder[idx + 1] : null
})

const hasOt01PrivacyTag = computed(() => props.task.ersCodes.includes('OT-01'))

const epicBadgeClass = computed(() => {
  switch (props.task.epicKey) {
    case 'PF-5':
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
    case 'PF-6':
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
    case 'PF-7':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
    case 'PF-8':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30'
    case 'PF-9':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30'
    default:
      return 'bg-slate-800 text-slate-300 border-slate-700'
  }
})

const onDragStart = (event: DragEvent) => {
  if (authStore.isReadOnly) {
    event.preventDefault()
    return
  }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', props.task.key)
  }
}

const openDetail = () => {
  scrumbanStore.activeTaskModalKey = props.task.key
}

const handleQuickMove = (targetCol: ColumnId | null, event: MouseEvent) => {
  event.stopPropagation()
  if (!targetCol) return
  scrumbanStore.moveTask(props.task.key, targetCol)
}
</script>

<template>
  <article
    :draggable="!authStore.isReadOnly"
    @dragstart="onDragStart"
    @click="openDetail"
    class="group relative rounded-xl border border-slate-800/90 bg-slate-900/90 p-3.5 shadow-sm transition-all duration-150 hover:border-emerald-500/50 hover:bg-slate-900 hover:shadow-md hover:shadow-emerald-950/30"
    :class="authStore.isReadOnly ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'"
  >
    <!-- Fila superior: Clave PF-XX, Épica, Sprint escalar único y Story Points -->
    <div class="flex items-center justify-between gap-1.5 mb-2">
      <div class="flex flex-wrap items-center gap-1.5">
        <span
          class="rounded-md bg-slate-950 px-2 py-0.5 font-mono text-xs font-extrabold text-emerald-400 border border-slate-800"
        >
          {{ task.key }}
        </span>
        <span
          class="rounded-md border px-1.5 py-0.5 font-mono text-[10px] font-semibold"
          :class="epicBadgeClass"
          :title="epic?.name"
        >
          {{ task.epicKey }} • {{ epic?.moduleCode }}
        </span>
        <span
          v-if="task.sprintId"
          class="rounded bg-slate-800/90 px-1.5 py-0.5 font-mono text-[10px] font-medium text-slate-300"
        >
          {{ task.sprintId.toUpperCase() }}
        </span>
      </div>

      <div class="flex items-center gap-1">
        <span
          class="rounded-full bg-slate-950 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-300 border border-slate-800"
          title="Puntos de Historia (Story Points)"
        >
          {{ task.storyPoints }} SP
        </span>
      </div>
    </div>

    <!-- Título de la historia / tarea -->
    <h4 class="text-xs font-semibold leading-snug text-slate-100 group-hover:text-emerald-300 transition mb-2.5">
      {{ task.title }}
    </h4>

    <!-- Alerta ética OT-01 si aplica -->
    <div
      v-if="hasOt01PrivacyTag"
      class="mb-2.5 flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 px-2 py-1 text-[10px] font-medium text-rose-200"
    >
      <ShieldAlert class="h-3.5 w-3.5 text-rose-400 shrink-0" />
      <span>Restricción OT-01: Cero captura facial / peatonal</span>
    </div>

    <!-- Badges de trazabilidad ERS (RF-XX, RNF-XX, INT-XX, CU-XX) y Capa -->
    <div class="flex flex-wrap items-center gap-1 mb-2.5">
      <span
        class="rounded bg-slate-950 px-1.5 py-0.5 font-mono text-[10px] text-cyan-300 border border-slate-800"
      >
        {{ task.layer }}
      </span>
      <span
        v-for="code in task.ersCodes"
        :key="code"
        class="rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold border"
        :class="
          code === 'OT-01'
            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            : code.startsWith('RF-')
              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
              : code.startsWith('RNF-')
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
        "
        :title="scrumbanStore.getErsByCode(code)?.name"
      >
        {{ code }}
      </span>
      <span
        v-for="cu in task.useCases"
        :key="cu"
        class="rounded bg-purple-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-purple-300 border border-purple-500/30"
      >
        {{ cu }}
      </span>
    </div>

    <!-- Rama de GitHub asociada -->
    <div
      class="mb-3 flex items-center justify-between gap-1 rounded-lg bg-slate-950/90 px-2 py-1 border border-slate-800/80"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <GitBranch class="h-3 w-3 text-emerald-400 shrink-0" />
        <span class="truncate font-mono text-[10px] text-slate-300">
          {{ task.githubBranch }}
        </span>
      </div>
      <span
        v-if="task.pullRequestUrl"
        class="inline-flex items-center gap-0.5 font-mono text-[10px] text-cyan-400 shrink-0"
        title="Pull Request vinculado"
      >
        PR <ExternalLink class="h-2.5 w-2.5" />
      </span>
    </div>

    <!-- Pie de tarjeta: Responsable(s), subtareas y controles rápidos de transición -->
    <div class="flex items-center justify-between border-t border-slate-800/80 pt-2.5">
      <div class="flex items-center gap-2 min-w-0">
        <div class="flex -space-x-1.5 shrink-0">
          <div
            v-if="assignee"
            class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-slate-900"
            :class="assignee.avatarColor"
            :title="`${assignee.name} (${assignee.projectRole})`"
          >
            {{ assignee.avatarInitials }}
          </div>
          <div
            v-if="coAssignee"
            class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ring-1 ring-slate-900"
            :class="coAssignee.avatarColor"
            :title="`${coAssignee.name} (${coAssignee.projectRole})`"
          >
            {{ coAssignee.avatarInitials }}
          </div>
        </div>
        <span class="truncate text-[11px] font-medium text-slate-300">
          {{ assignee?.name.split(' ')[0] }}
          {{ assignee?.name.split(' ')[2] || '' }}
          <template v-if="coAssignee">
            &amp; {{ coAssignee.name.split(' ')[0] }}
          </template>
        </span>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <!-- Contador de subtareas -->
        <span
          v-if="task.subtasks.length > 0"
          class="flex items-center gap-1 font-mono text-[10px]"
          :class="
            completedSubtasksCount === task.subtasks.length
              ? 'text-emerald-400'
              : 'text-slate-400'
          "
        >
          <CheckSquare class="h-3 w-3" />
          {{ completedSubtasksCount }}/{{ task.subtasks.length }}
        </span>

        <!-- Contador de comentarios -->
        <span
          v-if="task.comments.length > 0"
          class="flex items-center gap-0.5 font-mono text-[10px] text-slate-400"
        >
          <MessageSquare class="h-3 w-3" />
          {{ task.comments.length }}
        </span>

        <!-- Botones rápidos para mover columna si no es Read-Only -->
        <div v-if="!authStore.isReadOnly" class="flex items-center gap-0.5">
          <button
            v-if="prevColumn"
            type="button"
            @click="handleQuickMove(prevColumn, $event)"
            class="rounded bg-slate-800 p-1 text-slate-300 hover:bg-slate-700 hover:text-white transition"
            :title="`Mover a ${prevColumn}`"
          >
            <ChevronLeft class="h-3 w-3" />
          </button>
          <button
            v-if="nextColumn"
            type="button"
            @click="handleQuickMove(nextColumn, $event)"
            class="rounded bg-emerald-600/20 p-1 text-emerald-300 hover:bg-emerald-600 hover:text-white transition"
            :title="`Avanzar a ${nextColumn}`"
          >
            <ChevronRight class="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  </article>
</template>
