<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  ExternalLink,
  ShieldAlert
} from 'lucide-vue-next'
import { useScrumbanStore } from '@/stores/useScrumbanStore'
import { useAuthStore } from '@/stores/useAuthStore'

const scrumbanStore = useScrumbanStore()
const authStore = useAuthStore()

const categoryFilter = ref<string>('ALL')
const priorityFilter = ref<string>('ALL')
const searchErs = ref<string>('')

const categories = computed(() => {
  const set = new Set<string>()
  scrumbanStore.ersRequirements.forEach((r) => set.add(r.category))
  return Array.from(set)
})

const enrichedRequirements = computed(() => {
  return scrumbanStore.ersRequirements
    .filter((req) => {
      if (categoryFilter.value !== 'ALL' && req.category !== categoryFilter.value) {
        return false
      }
      if (priorityFilter.value !== 'ALL' && req.priority !== priorityFilter.value) {
        return false
      }
      if (searchErs.value.trim()) {
        const q = searchErs.value.trim().toLowerCase()
        const matchCode = req.code.toLowerCase().includes(q)
        const matchName = req.name.toLowerCase().includes(q)
        const matchCriteria = req.criteria.toLowerCase().includes(q)
        if (!matchCode && !matchName && !matchCriteria) return false
      }
      return true
    })
    .map((req) => {
      const linkedEpics = scrumbanStore.epics.filter((ep) => ep.ersCodes.includes(req.code))
      const linkedTasks = scrumbanStore.tasks.filter((t) => t.ersCodes.includes(req.code))
      const doneTasks = linkedTasks.filter((t) => t.columnId === 'DONE')
      const inProgressOrReview = linkedTasks.filter(
        (t) => t.columnId === 'IN_PROGRESS' || t.columnId === 'IN_REVIEW'
      )

      let coveragePercent = 0
      if (linkedTasks.length > 0) {
        const weighted = linkedTasks.reduce((acc, t) => {
          if (t.columnId === 'DONE') return acc + 1
          if (t.columnId === 'IN_REVIEW') return acc + 0.75
          if (t.columnId === 'IN_PROGRESS') return acc + 0.45
          if (t.columnId === 'TO_DO') return acc + 0.15
          return acc
        }, 0)
        coveragePercent = Math.round((weighted / linkedTasks.length) * 100)
      }

      return {
        ...req,
        linkedEpics,
        linkedTasks,
        doneCount: doneTasks.length,
        activeCount: inProgressOrReview.length,
        coveragePercent
      }
    })
})

const globalTraceabilityStats = computed(() => {
  const totalReqs = scrumbanStore.ersRequirements.length
  const coveredReqs = scrumbanStore.ersRequirements.filter((r) =>
    scrumbanStore.tasks.some((t) => t.ersCodes.includes(r.code))
  ).length
  const avgCoverage =
    enrichedRequirements.value.length > 0
      ? Math.round(
          enrichedRequirements.value.reduce((acc, r) => acc + r.coveragePercent, 0) /
            enrichedRequirements.value.length
        )
      : 0

  return {
    totalReqs,
    coveredReqs,
    coverageRatio: Math.round((coveredReqs / totalReqs) * 100),
    avgCoverage
  }
})

const openTask = (taskKey: string) => {
  scrumbanStore.activeTaskModalKey = taskKey
}
</script>

<template>
  <section class="mx-auto max-w-[1600px] px-4 py-6 space-y-6">
    <!-- Encabezado y KPIs de Trazabilidad ERSIS2026 III -->
    <div
      class="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 p-5 shadow-lg"
    >
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <FileSpreadsheet class="h-5 w-5 text-emerald-400" />
            <h2 class="text-lg font-bold text-white">
              Matriz de Trazabilidad Bidireccional — ERSIS2026 III vs. Tablero Scrumban
            </h2>
          </div>
          <p class="text-xs text-slate-400 max-w-4xl">
            Cruce en tiempo real entre los <strong>22 requisitos oficiales del ERS</strong>
            (`INT-UI`, `INT-HW`, `INT-SW`, `INT-COM`, `RF`, `RNF`, `OT-01`), las
            <strong>5 Épicas (`PF-5` a `PF-9`)</strong> y las
            <strong>15 Tareas (`PF-10` a `PF-24`)</strong> del proyecto PARK FLOW.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3 shrink-0">
          <div class="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5">
            <span class="block text-[10px] font-bold uppercase text-emerald-300">
              Cobertura de Requisitos ERS
            </span>
            <p class="font-mono text-lg font-extrabold text-white">
              {{ globalTraceabilityStats.coveredReqs }}/{{ globalTraceabilityStats.totalReqs }}
              <span class="text-xs text-emerald-300">({{ globalTraceabilityStats.coverageRatio }}%)</span>
            </p>
          </div>

          <div class="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2.5">
            <span class="block text-[10px] font-bold uppercase text-cyan-300">
              Avance Ponderado de Implementación
            </span>
            <p class="font-mono text-lg font-extrabold text-white">
              {{ globalTraceabilityStats.avgCoverage }}%
            </p>
          </div>
        </div>
      </div>

      <!-- Tarjetas de las 5 Épicas (PF-5 a PF-9) -->
      <div class="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          v-for="epic in scrumbanStore.epics"
          :key="epic.key"
          class="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5"
        >
          <div class="flex items-center justify-between mb-1.5">
            <span class="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-xs font-extrabold text-emerald-300">
              {{ epic.key }} • {{ epic.moduleCode }}
            </span>
            <span class="font-mono text-[10px] text-cyan-300">
              {{ epic.layer }}
            </span>
          </div>
          <h3 class="text-xs font-bold text-white mb-1">{{ epic.name }}</h3>
          <p class="text-[11px] text-slate-400 line-clamp-2 mb-2">
            {{ epic.description }}
          </p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="c in epic.ersCodes"
              :key="c"
              class="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-[10px] text-slate-300 border border-slate-800"
            >
              {{ c }}
            </span>
          </div>
        </div>
      </div>

      <!-- Filtros de la Matriz -->
      <div class="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
        <div class="relative flex-1 min-w-[220px]">
          <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            v-model="searchErs"
            type="text"
            placeholder="Filtrar por código (RF-01, RNF-07, OT-01), nombre o métrica..."
            class="w-full rounded-lg border border-slate-800 bg-slate-950 pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <select
          v-model="categoryFilter"
          class="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200"
        >
          <option value="ALL">Todas las Categorías ERS</option>
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>

        <select
          v-model="priorityFilter"
          class="rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200"
        >
          <option value="ALL">Todas las Prioridades</option>
          <option value="Alta/Esencial">Alta / Esencial</option>
          <option value="Media/Deseado">Media / Deseado</option>
        </select>
      </div>
    </div>

    <!-- Tabla Interactiva de los 22 Requisitos del ERSIS2026 III -->
    <div class="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th class="py-3.5 px-4">Código ERS</th>
              <th class="py-3.5 px-4">Categoría &amp; Prioridad</th>
              <th class="py-3.5 px-4">Requisito y Criterio Técnico / SLA</th>
              <th class="py-3.5 px-4">Épica(s)</th>
              <th class="py-3.5 px-4">Tareas Vinculadas (PF-10 a PF-24)</th>
              <th class="py-3.5 px-4 w-44">Avance Real</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/80 text-xs">
            <tr
              v-for="req in enrichedRequirements"
              :key="req.code"
              class="hover:bg-slate-800/40 transition"
            >
              <!-- Código -->
              <td class="py-3.5 px-4 align-top whitespace-nowrap">
                <span
                  class="inline-flex items-center gap-1 rounded-md px-2.5 py-1 font-mono text-xs font-extrabold border"
                  :class="
                    req.code === 'OT-01'
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                      : req.code.startsWith('RF-')
                        ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : req.code.startsWith('RNF-')
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                  "
                >
                  <ShieldAlert v-if="req.code === 'OT-01'" class="h-3.5 w-3.5" />
                  {{ req.code }}
                </span>
                <div v-if="req.useCases?.length" class="mt-1.5 flex flex-wrap gap-1">
                  <span
                    v-for="cu in req.useCases"
                    :key="cu"
                    class="rounded bg-purple-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-purple-300"
                  >
                    {{ cu }}
                  </span>
                </div>
              </td>

              <!-- Categoría & Prioridad -->
              <td class="py-3.5 px-4 align-top whitespace-nowrap">
                <p class="font-semibold text-slate-200">{{ req.category }}</p>
                <span
                  class="mt-1 inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold"
                  :class="
                    req.priority === 'Alta/Esencial'
                      ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-slate-800 text-slate-300'
                  "
                >
                  {{ req.priority }}
                </span>
              </td>

              <!-- Nombre y Criterio Técnico -->
              <td class="py-3.5 px-4 align-top max-w-md">
                <p class="font-bold text-white mb-1">{{ req.name }}</p>
                <p class="text-[11px] text-slate-400 leading-relaxed">
                  {{ req.criteria }}
                </p>
              </td>

              <!-- Épicas -->
              <td class="py-3.5 px-4 align-top whitespace-nowrap">
                <div class="flex flex-col gap-1">
                  <span
                    v-for="ep in req.linkedEpics"
                    :key="ep.key"
                    class="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-0.5 font-mono text-[11px] font-semibold text-cyan-300 border border-slate-800"
                  >
                    {{ ep.key }} ({{ ep.moduleCode }})
                  </span>
                </div>
              </td>

              <!-- Tareas PF-10 a PF-24 -->
              <td class="py-3.5 px-4 align-top">
                <div class="flex flex-wrap gap-1.5">
                  <button
                    v-for="t in req.linkedTasks"
                    :key="t.key"
                    type="button"
                    @click="openTask(t.key)"
                    class="group flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-left transition"
                    :class="{
                      'border-emerald-500/50 bg-emerald-500/15 text-emerald-200':
                        t.columnId === 'DONE',
                      'border-purple-500/50 bg-purple-500/15 text-purple-200':
                        t.columnId === 'IN_REVIEW',
                      'border-amber-500/50 bg-amber-500/15 text-amber-200':
                        t.columnId === 'IN_PROGRESS',
                      'border-sky-500/40 bg-sky-500/10 text-sky-200':
                        t.columnId === 'TO_DO',
                      'border-slate-700 bg-slate-950 text-slate-300':
                        t.columnId === 'BACKLOG'
                    }"
                    :title="`${t.title} (${t.columnId})`"
                  >
                    <span class="font-mono font-extrabold">{{ t.key }}</span>
                    <span class="text-[10px] opacity-85">• {{ t.columnId }}</span>
                  </button>
                </div>
              </td>

              <!-- Barra de Avance -->
              <td class="py-3.5 px-4 align-top">
                <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                  <span class="font-bold text-white">{{ req.coveragePercent }}%</span>
                  <span class="text-slate-400">
                    {{ req.doneCount }}/{{ req.linkedTasks.length }} DONE
                  </span>
                </div>
                <div class="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="
                      req.coveragePercent === 100
                        ? 'bg-emerald-500'
                        : req.coveragePercent >= 50
                          ? 'bg-cyan-500'
                          : req.coveragePercent > 0
                            ? 'bg-amber-500'
                            : 'bg-slate-700'
                    "
                    :style="{ width: `${req.coveragePercent}%` }"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Tabla Resumen de Matriz RBAC del Equipo PARK FLOW (Sección 4 de AGENTS.md) -->
    <div class="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
      <h3 class="text-sm font-bold text-white mb-1 flex items-center gap-2">
        <ShieldCheck class="h-4 w-4 text-emerald-400" />
        Matriz Oficial del Equipo PARK FLOW y Control de Acceso Basado en Roles (RBAC)
      </h3>
      <p class="text-xs text-slate-400 mb-4">
        Matriz oficial de permisos RBAC protegida con autenticación institucional `@morelia.tecnm.mx` y validación en Netlify Functions.
      </p>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase text-slate-400">
              <th class="py-2.5 px-3">Integrante</th>
              <th class="py-2.5 px-3">No. Control</th>
              <th class="py-2.5 px-3">Correo Institucional</th>
              <th class="py-2.5 px-3">Rol en Proyecto</th>
              <th class="py-2.5 px-3">Rol RBAC</th>
              <th class="py-2.5 px-3">Permisos en el Gestor Scrumban</th>
              <th class="py-2.5 px-3">Estado</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/70">
            <tr
              v-for="m in authStore.members"
              :key="m.id"
              class="hover:bg-slate-800/40"
              :class="authStore.currentUser.id === m.id ? 'bg-emerald-950/20' : ''"
            >
              <td class="py-2.5 px-3 font-semibold text-white">{{ m.name }}</td>
              <td class="py-2.5 px-3 font-mono text-slate-300">{{ m.controlNumber }}</td>
              <td class="py-2.5 px-3 font-mono text-emerald-300">{{ m.email }}</td>
              <td class="py-2.5 px-3 text-slate-300">{{ m.projectRole }}</td>
              <td class="py-2.5 px-3 font-mono font-bold text-cyan-300">{{ m.rbacRole }}</td>
              <td class="py-2.5 px-3 text-slate-400 max-w-md">{{ m.permissionsSummary }}</td>
              <td class="py-2.5 px-3">
                <span
                  v-if="authStore.currentUser.id === m.id"
                  class="inline-block rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  Sesión Activa
                </span>
                <span
                  v-else
                  class="inline-block rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-400"
                >
                  Protegido
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
