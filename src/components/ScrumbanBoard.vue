<script setup lang="ts">
import { ref } from 'vue'
import {
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Activity,
  ShieldCheck,
  Layers,
  History,
  CheckCircle2,
  Lock
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useScrumbanStore } from '@/stores/useScrumbanStore'
import TaskCard from '@/components/TaskCard.vue'
import type { ColumnId } from '@/types/scrumban'

const authStore = useAuthStore()
const scrumbanStore = useScrumbanStore()

const dragOverColumn = ref<ColumnId | null>(null)
const showAuditLog = ref<boolean>(false)

const onDragOver = (colId: ColumnId, event: DragEvent) => {
  if (authStore.isReadOnly) return
  event.preventDefault()
  dragOverColumn.value = colId
}

const onDragLeave = (colId: ColumnId) => {
  if (dragOverColumn.value === colId) {
    dragOverColumn.value = null
  }
}

const onDrop = (colId: ColumnId, event: DragEvent) => {
  dragOverColumn.value = null
  if (authStore.isReadOnly) return
  const taskKey = event.dataTransfer?.getData('text/plain')
  if (taskKey) {
    scrumbanStore.moveTask(taskKey, colId)
  }
}

const clearFilters = () => {
  scrumbanStore.selectedEpicFilter = 'ALL'
  scrumbanStore.selectedLayerFilter = 'ALL'
  scrumbanStore.selectedAssigneeFilter = 'ALL'
  scrumbanStore.selectedErsFilter = 'ALL'
  scrumbanStore.searchQuery = ''
}
</script>

<template>
  <section class="mx-auto max-w-[1600px] px-4 py-5 space-y-5">
    <!-- Banner de Resumen del Sprint y Métricas Scrumban -->
    <div
      class="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-4 shadow-lg"
    >
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div class="space-y-1">
          <div class="flex flex-wrap items-center gap-2">
            <span
              class="rounded-md px-2 py-0.5 font-mono text-xs font-bold"
              :class="
                scrumbanStore.currentViewedSprint?.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : scrumbanStore.currentViewedSprint?.status === 'COMPLETED'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              "
            >
              {{
                scrumbanStore.currentViewedSprint
                  ? `${scrumbanStore.currentViewedSprint.id.toUpperCase()} • ${scrumbanStore.currentViewedSprint.status}`
                  : 'VISTA GLOBAL (3 SPRINTS)'
              }}
            </span>
            <h2 class="text-sm sm:text-base font-bold text-white">
              {{
                scrumbanStore.currentViewedSprint
                  ? scrumbanStore.currentViewedSprint.name
                  : 'Backlog Completo y Sprints del Proyecto PARK FLOW (PF-10 a PF-24)'
              }}
            </h2>
          </div>
          <p class="text-xs text-slate-400 max-w-4xl">
            {{
              scrumbanStore.currentViewedSprint
                ? scrumbanStore.currentViewedSprint.goal
                : 'Visualizando las 15 historias técnicas trazadas a las 5 Épicas (PF-5 a PF-9) y los 22 requisitos del ERSIS2026 III.'
            }}
          </p>
        </div>

        <!-- KPIs Scrumban: Story Points, WIP, Lead/Cycle Time y Bitácora -->
        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          <div class="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
            <span class="block text-[10px] font-semibold uppercase text-slate-400">
              Avance Story Points
            </span>
            <div class="flex items-baseline gap-1.5">
              <span class="font-mono text-sm font-extrabold text-emerald-400">
                {{ scrumbanStore.boardMetrics.donePoints }}/{{ scrumbanStore.boardMetrics.totalPoints }} SP
              </span>
              <span class="text-[11px] font-semibold text-slate-300">
                ({{ scrumbanStore.boardMetrics.progressPercent }}%)
              </span>
            </div>
          </div>

          <div class="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2">
            <span class="block text-[10px] font-semibold uppercase text-slate-400">
              Lead / Cycle Time
            </span>
            <div class="flex items-center gap-1.5 font-mono text-xs font-bold text-cyan-300">
              <Clock class="h-3.5 w-3.5" />
              <span>{{ scrumbanStore.boardMetrics.avgLeadTime }}d / {{ scrumbanStore.boardMetrics.avgCycleTime }}d</span>
            </div>
          </div>

          <button
            type="button"
            @click="showAuditLog = !showAuditLog"
            class="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/90 px-3 py-2 text-xs font-semibold text-slate-200 hover:border-emerald-500/50 hover:text-white transition"
          >
            <History class="h-4 w-4 text-emerald-400" />
            <span>Auditoría RBAC ({{ scrumbanStore.auditLog.length }})</span>
          </button>
        </div>
      </div>

      <!-- Barra de filtros por Épica (PF-5 a PF-9), Capa, Responsable, Código ERS y Búsqueda -->
      <div class="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
        <!-- Búsqueda rápida -->
        <div class="relative flex-1 min-w-[210px]">
          <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            v-model="scrumbanStore.searchQuery"
            type="text"
            placeholder="Buscar por PF-XX, título, rama GitHub o código ERS (ej. OT-01, RF-03)..."
            class="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <!-- Filtro por Épica -->
        <select
          v-model="scrumbanStore.selectedEpicFilter"
          class="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Todas las Épicas (PF-5 a PF-9)</option>
          <option v-for="ep in scrumbanStore.epics" :key="ep.key" :value="ep.key">
            {{ ep.key }} ({{ ep.moduleCode }}): {{ ep.name }}
          </option>
        </select>

        <!-- Filtro por Capa Arquitectónica (RNF-05) -->
        <select
          v-model="scrumbanStore.selectedLayerFilter"
          class="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Todas las Capas (RNF-05)</option>
          <option value="/cv-service">/cv-service (Python + YOLO + RTSP)</option>
          <option value="/api-backend">/api-backend (FastAPI + PostgreSQL + WS)</option>
          <option value="/client-app">/client-app (PWA Móvil + Dashboard + LED)</option>
        </select>

        <!-- Filtro por Responsable -->
        <select
          v-model="scrumbanStore.selectedAssigneeFilter"
          class="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Todos los Integrantes (5)</option>
          <option
            v-for="m in authStore.members.filter((x) => x.rbacRole !== 'GUEST_VIEWER')"
            :key="m.id"
            :value="m.id"
          >
            {{ m.name }} ({{ m.rbacRole }})
          </option>
        </select>

        <!-- Filtro por Requisito ERS -->
        <select
          v-model="scrumbanStore.selectedErsFilter"
          class="rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none"
        >
          <option value="ALL">Todos los Requisitos ERS (22)</option>
          <option
            v-for="req in scrumbanStore.ersRequirements"
            :key="req.code"
            :value="req.code"
          >
            {{ req.code }} — {{ req.name }}
          </option>
        </select>

        <button
          v-if="
            scrumbanStore.selectedEpicFilter !== 'ALL' ||
            scrumbanStore.selectedLayerFilter !== 'ALL' ||
            scrumbanStore.selectedAssigneeFilter !== 'ALL' ||
            scrumbanStore.selectedErsFilter !== 'ALL' ||
            scrumbanStore.searchQuery
          "
          type="button"
          @click="clearFilters"
          class="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-emerald-300 hover:bg-slate-700"
        >
          Limpiar filtros
        </button>
      </div>
    </div>

    <!-- Panel desplegable de Bitácora de Auditoría RBAC -->
    <div
      v-if="showAuditLog"
      class="rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl"
    >
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-2">
          <ShieldCheck class="h-4 w-4 text-emerald-400" />
          <h3 class="text-xs font-bold uppercase tracking-wider text-white">
            Bitácora de Auditoría en Tiempo Real (RBAC &amp; Protección Anti-Cierre de Sprints)
          </h3>
        </div>
        <button
          type="button"
          @click="showAuditLog = false"
          class="text-xs text-slate-400 hover:text-white"
        >
          Ocultar
        </button>
      </div>
      <div class="max-h-48 overflow-y-auto space-y-1.5 pr-1">
        <div
          v-for="entry in scrumbanStore.auditLog"
          :key="entry.id"
          class="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-800/80 bg-slate-950/70 px-3 py-1.5 text-xs"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300">
              {{ entry.action }}
            </span>
            <span class="font-semibold text-white">{{ entry.actorName }}</span>
            <span class="font-mono text-[10px] text-slate-400">({{ entry.actorRole }})</span>
            <span class="text-slate-300">{{ entry.details }}</span>
          </div>
          <span class="font-mono text-[10px] text-slate-500">
            {{ new Date(entry.timestamp).toLocaleString('es-MX') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Grid de 5 Columnas del Tablero Scrumban -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
      <div
        v-for="col in scrumbanStore.columns"
        :key="col.id"
        @dragover="onDragOver(col.id, $event)"
        @dragleave="onDragLeave(col.id)"
        @drop="onDrop(col.id, $event)"
        class="flex flex-col rounded-2xl border bg-slate-900/50 transition-colors min-h-[580px]"
        :class="[
          dragOverColumn === col.id
            ? 'border-emerald-500 bg-emerald-950/20'
            : scrumbanStore.isColumnAtOrOverWip(col.id)
              ? 'border-amber-500/60 bg-slate-900/70'
              : 'border-slate-800/90'
        ]"
      >
        <!-- Encabezado de Columna con Contador WIP en tiempo real -->
        <div class="border-b border-slate-800/90 p-3.5">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <span
                class="h-2.5 w-2.5 rounded-full"
                :class="{
                  'bg-slate-400': col.id === 'BACKLOG',
                  'bg-sky-400': col.id === 'TO_DO',
                  'bg-amber-400': col.id === 'IN_PROGRESS',
                  'bg-purple-400': col.id === 'IN_REVIEW',
                  'bg-emerald-400': col.id === 'DONE'
                }"
              />
              <h3 class="text-xs font-extrabold uppercase tracking-wider text-white">
                {{ col.title }}
              </h3>
            </div>

            <!-- Badge de conteo y límite WIP -->
            <div class="flex items-center gap-1">
              <span
                v-if="col.wipLimit !== null"
                class="flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-bold border"
                :class="
                  scrumbanStore.isColumnAtOrOverWip(col.id)
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse'
                    : 'bg-slate-950 text-slate-200 border-slate-800'
                "
              >
                <AlertTriangle
                  v-if="scrumbanStore.isColumnAtOrOverWip(col.id)"
                  class="h-3 w-3 text-amber-400"
                />
                WIP {{ scrumbanStore.getWipCountForColumn(col.id) }}/{{ col.wipLimit }}
              </span>
              <span
                v-else
                class="rounded-md bg-slate-950 px-2 py-0.5 font-mono text-xs font-bold text-slate-300 border border-slate-800"
              >
                {{ scrumbanStore.getTasksByColumn(col.id).length }}
              </span>
            </div>
          </div>

          <p class="mt-1 text-[11px] text-slate-400">
            {{ col.subtitle }}
          </p>

          <!-- Alerta de Cuello de Botella WIP si llegó al límite -->
          <div
            v-if="scrumbanStore.isColumnAtOrOverWip(col.id)"
            class="mt-2 flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-950/40 px-2.5 py-1.5 text-[10px] font-semibold text-amber-200"
          >
            <AlertTriangle class="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <span>
              Límite WIP alcanzado ({{ col.wipLimit }} máx). Bloqueo activo salvo override de PO.
            </span>
          </div>
        </div>

        <!-- Lista de tarjetas en la columna -->
        <div class="flex-1 space-y-3 p-3">
          <TaskCard
            v-for="task in scrumbanStore.getTasksByColumn(col.id)"
            :key="task.key"
            :task="task"
          />

          <div
            v-if="scrumbanStore.getTasksByColumn(col.id).length === 0"
            class="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800/80 py-10 px-4 text-center"
          >
            <p class="text-xs font-medium text-slate-500">
              Sin tareas en "{{ col.title }}"
            </p>
            <p class="mt-1 text-[10px] text-slate-600">
              {{
                authStore.isReadOnly
                  ? 'Modo lectura activo'
                  : 'Arrastra una tarjeta aquí o usa las flechas rápidas'
              }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
