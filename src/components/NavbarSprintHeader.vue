<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  Eye,
  RotateCcw,
  Layers,
  Kanban,
  FileSpreadsheet,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  UserCheck,
  LogIn,
  Play
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useScrumbanStore } from '@/stores/useScrumbanStore'

const authStore = useAuthStore()
const scrumbanStore = useScrumbanStore()
const route = useRoute()
const router = useRouter()

const isRoleDropdownOpen = ref(false)
const institutionalInput = ref('')

const targetSprintForCompletion = computed(() => {
  if (scrumbanStore.selectedSprintFilter !== 'ALL') {
    return (
      scrumbanStore.sprints.find((s) => s.id === scrumbanStore.selectedSprintFilter) ||
      scrumbanStore.activeSprint
    )
  }
  return scrumbanStore.activeSprint
})

const sprintCompletionSummary = computed(() => {
  const sp = targetSprintForCompletion.value
  const allTasks = scrumbanStore.tasks.filter((t) => t.sprintId === sp.id)
  const completed = allTasks.filter((t) => t.columnId === 'DONE')
  const pending = allTasks.filter((t) => t.columnId !== 'DONE')
  const nextSprintLabel =
    sp.id === 'sprint-1'
      ? 'Sprint 2'
      : sp.id === 'sprint-2'
        ? 'Sprint 3'
        : 'Product Backlog'

  return {
    sprint: sp,
    totalCount: allTasks.length,
    completed,
    pending,
    nextSprintLabel
  }
})

const handleSelectMember = (memberId: string) => {
  const member = authStore.getMemberById(memberId)
  authStore.switchUserById(memberId)
  isRoleDropdownOpen.value = false
  if (member) {
    if (member.rbacRole === 'GUEST_VIEWER' && route.path !== '/guest') {
      router.push('/guest')
    } else if (member.rbacRole !== 'GUEST_VIEWER' && route.path === '/guest') {
      router.push('/')
    }
    scrumbanStore.pushToast(
      'info',
      `Rol Activo: ${member.name}`,
      `${member.email} — ${authStore.roleBadgeLabel(member.rbacRole)}`,
      3000
    )
  }
}

const handleQuickLoginSubmit = () => {
  const res = authStore.loginWithInstitutionalInput(institutionalInput.value)
  if (res.ok) {
    institutionalInput.value = ''
    isRoleDropdownOpen.value = false
    if (authStore.isReadOnly && route.path !== '/guest') {
      router.push('/guest')
    } else if (!authStore.isReadOnly && route.path === '/guest') {
      router.push('/')
    }
    scrumbanStore.pushToast('success', 'Autenticación Institucional TecNM', res.message)
  } else {
    scrumbanStore.pushToast('error', 'Error de Autenticación (RNF-02)', res.message)
  }
}

const activateGuestRoute = () => {
  authStore.enterGuestEvaluatorMode()
  isRoleDropdownOpen.value = false
  router.push('/guest')
  scrumbanStore.pushToast(
    'info',
    'Modo Evaluador / Invitado Activo',
    'Vista de solo lectura estricta (Read-Only) para la Prof. Alma Lilia Núñez González / Evaluadores.',
    3500
  )
}

const openCompleteSprintModal = () => {
  if (!authStore.canManageSprints) {
    scrumbanStore.pushToast(
      'error',
      'Acción Protegida por RBAC',
      'Solo Haziel Ruiz Zúñiga (l221213339@morelia.tecnm.mx — ADMIN_PO_SM) puede completar o cerrar Sprints.'
    )
    return
  }
  scrumbanStore.isCompleteSprintModalOpen = true
}

const confirmCompleteSprint = () => {
  scrumbanStore.completeSprint(targetSprintForCompletion.value.id)
}
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
    <!-- Banner superior de Modo Evaluador Read-Only si aplica -->
    <div
      v-if="authStore.isReadOnly"
      class="flex flex-wrap items-center justify-between gap-2 bg-rose-950/80 px-4 py-1.5 text-xs text-rose-200 border-b border-rose-800/60"
    >
      <div class="flex items-center gap-2 font-medium">
        <Eye class="h-4 w-4 text-rose-400 shrink-0" />
        <span>
          <strong>MODO EVALUADOR / INVITADO (SOLO LECTURA ESTRICTA — /guest):</strong>
          Bienvenida Prof. Alma Lilia Núñez González. Puede inspeccionar el tablero Scrumban, métricas y matriz ERSIS2026 III con 0 riesgo de alterar tareas o cerrar Sprints.
        </span>
      </div>
      <button
        type="button"
        @click="handleSelectMember('member-haziel')"
        class="rounded bg-rose-800/80 px-2.5 py-0.5 text-[11px] font-semibold text-white hover:bg-rose-700 transition"
      >
        Cambiar a Haziel (PO/SM)
      </button>
    </div>

    <div class="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-4 py-3">
      <!-- Identidad del proyecto PARK FLOW -->
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 font-mono text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20"
        >
          PF
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base font-bold tracking-tight text-white">
              PARK FLOW
            </h1>
            <span
              class="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-300 border border-emerald-500/30"
            >
              Scrumban Engine v1.0
            </span>
            <span
              class="hidden sm:inline-flex items-center gap-1 rounded-md bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300"
            >
              TecNM Morelia • ERSIS2026 III
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Monitoreo de Estacionamiento por Visión Computacional (`OT-01` Sin Captura Facial)
          </p>
        </div>
      </div>

      <!-- Navegación Central: Tablero vs Matriz ERS + Selector de Sprint -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex rounded-lg bg-slate-900 p-1 border border-slate-800">
          <router-link
            :to="authStore.isReadOnly ? '/guest' : '/'"
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition"
            :class="
              route.path === '/' || route.path === '/guest'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            "
          >
            <Kanban class="h-3.5 w-3.5" />
            Tablero Scrumban
          </router-link>
          <router-link
            to="/traceability"
            class="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition"
            :class="
              route.path === '/traceability'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            "
          >
            <FileSpreadsheet class="h-3.5 w-3.5" />
            Matriz ERSIS2026 III (22 Req)
          </router-link>
        </div>

        <!-- Selector escalar de Sprint -->
        <div class="flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 border border-slate-800">
          <Layers class="h-3.5 w-3.5 text-cyan-400" />
          <label for="sprint-select" class="text-[11px] font-medium text-slate-400">Sprint:</label>
          <select
            id="sprint-select"
            v-model="scrumbanStore.selectedSprintFilter"
            class="bg-transparent text-xs font-semibold text-slate-100 focus:outline-none cursor-pointer"
          >
            <option
              v-for="sp in scrumbanStore.sprints"
              :key="sp.id"
              :value="sp.id"
              class="bg-slate-900 text-slate-100"
            >
              {{ sp.id.toUpperCase() }} ({{
                sp.status === 'ACTIVE'
                  ? 'ACTIVO'
                  : sp.status === 'COMPLETED'
                    ? 'COMPLETADO'
                    : 'PLANEADO'
              }})
            </option>
            <option value="ALL" class="bg-slate-900 text-slate-100">
              Todos los Sprints (PF-10 a PF-24)
            </option>
          </select>
        </div>

        <!-- Botón Iniciar Sprint si el sprint seleccionado está PLANNED y el usuario es Haziel -->
        <button
          v-if="
            authStore.canManageSprints &&
            targetSprintForCompletion.status === 'PLANNED'
          "
          type="button"
          @click="scrumbanStore.startSprint(targetSprintForCompletion.id)"
          class="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 transition shadow-sm"
        >
          <Play class="h-3.5 w-3.5" />
          Iniciar {{ targetSprintForCompletion.id.toUpperCase() }}
        </button>

        <!-- Botón Completar Sprint protegido por RBAC (Regla 5.2 de AGENTS.md) -->
        <button
          type="button"
          @click="openCompleteSprintModal"
          :disabled="!authStore.canManageSprints || targetSprintForCompletion.status === 'COMPLETED'"
          class="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition border"
          :class="
            authStore.canManageSprints && targetSprintForCompletion.status !== 'COMPLETED'
              ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-200 hover:bg-emerald-600 hover:text-white cursor-pointer'
              : 'bg-slate-900/80 border-slate-800 text-slate-500 cursor-not-allowed'
          "
          :title="
            authStore.canManageSprints
              ? 'Completar Sprint activo y transferir pendientes al siguiente Sprint'
              : 'Bloqueado por RBAC: Solo Haziel Ruiz Zúñiga (ADMIN_PO_SM) puede completar o cerrar Sprints'
          "
        >
          <CheckCircle2 v-if="authStore.canManageSprints" class="h-3.5 w-3.5 text-emerald-400" />
          <Lock v-else class="h-3.5 w-3.5 text-amber-500" />
          <span>Completar Sprint</span>
        </button>

        <!-- Toggle Override WIP exclusivo para Haziel (ADMIN_PO_SM) -->
        <label
          v-if="authStore.isAdminPoSm"
          class="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-[11px] font-medium text-amber-200 cursor-pointer"
          title="Exclusivo ADMIN_PO_SM: Permite exceder temporalmente el límite WIP (4 en Progreso / 3 en Revisión)"
        >
          <input
            type="checkbox"
            v-model="scrumbanStore.adminWipOverrideEnabled"
            class="h-3.5 w-3.5 rounded accent-amber-500"
          />
          <span>Override WIP (PO)</span>
        </label>
      </div>

      <!-- Controles Derechos: Acceso Rápido /guest, Selector de Usuario RBAC (@morelia.tecnm.mx) y Reset -->
      <div class="flex items-center gap-2">
        <!-- Botón directo Modo Evaluador / Invitado (/guest) -->
        <button
          v-if="!authStore.isReadOnly"
          type="button"
          @click="activateGuestRoute"
          class="hidden xl:flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/10 px-2.5 py-1.5 text-xs font-medium text-rose-200 hover:bg-rose-500/20 transition"
          title="Activar vista de Evaluador / Invitado (Solo lectura estricta) en menos de 1 segundo"
        >
          <Eye class="h-3.5 w-3.5 text-rose-400" />
          Vista Evaluador (/guest)
        </button>

        <!-- Selector de Rol / Usuario Institucional (@morelia.tecnm.mx) -->
        <div class="relative">
          <button
            type="button"
            @click="isRoleDropdownOpen = !isRoleDropdownOpen"
            class="flex items-center gap-2.5 rounded-xl border border-slate-700/80 bg-slate-900 px-3 py-1.5 text-left hover:border-emerald-500/50 transition"
          >
            <div
              class="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ring-2"
              :class="authStore.currentUser.avatarColor"
            >
              {{ authStore.currentUser.avatarInitials }}
            </div>
            <div class="hidden sm:block">
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-semibold text-white">
                  {{ authStore.currentUser.name.split(' ')[0] }}
                  {{ authStore.currentUser.name.split(' ')[2] || authStore.currentUser.name.split(' ')[1] }}
                </span>
                <span
                  class="rounded px-1.5 py-0.2 font-mono text-[10px] font-bold"
                  :class="{
                    'bg-emerald-500/20 text-emerald-300': authStore.currentRole === 'ADMIN_PO_SM',
                    'bg-indigo-500/20 text-indigo-300': authStore.currentRole === 'TECH_LEAD',
                    'bg-purple-500/20 text-purple-300': authStore.currentRole === 'DEV_QA',
                    'bg-sky-500/20 text-sky-300': authStore.currentRole === 'DEVELOPER',
                    'bg-rose-500/20 text-rose-300': authStore.currentRole === 'GUEST_VIEWER'
                  }"
                >
                  {{ authStore.currentRole }}
                </span>
              </div>
              <p class="font-mono text-[10px] text-slate-400">
                {{ authStore.currentUser.email }}
              </p>
            </div>
            <ChevronDown class="h-4 w-4 text-slate-400" />
          </button>

          <!-- Dropdown RBAC & Login Institucional @morelia.tecnm.mx -->
          <div
            v-if="isRoleDropdownOpen"
            class="absolute right-0 mt-2 w-96 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl z-50"
          >
            <div class="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
              <div class="flex items-center gap-2">
                <ShieldCheck class="h-4 w-4 text-emerald-400" />
                <span class="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Control de Acceso RBAC (RNF-02)
                </span>
              </div>
              <button
                type="button"
                @click="isRoleDropdownOpen = false"
                class="text-xs text-slate-400 hover:text-white"
              >
                Cerrar
              </button>
            </div>

            <!-- Input de correo institucional o No. Control -->
            <form @submit.prevent="handleQuickLoginSubmit" class="mb-3">
              <label class="block text-[11px] font-medium text-slate-400 mb-1">
                Ingresar con correo <code class="text-emerald-300">@morelia.tecnm.mx</code> o No. Control:
              </label>
              <div class="flex gap-1.5">
                <input
                  v-model="institutionalInput"
                  type="text"
                  placeholder="Ej. l221213339@morelia.tecnm.mx o 24120432"
                  class="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  class="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <LogIn class="h-3.5 w-3.5" />
                  Entrar
                </button>
              </div>
            </form>

            <p class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Cambio rápido de perfil para demostración / evaluación:
            </p>

            <div class="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              <button
                v-for="member in authStore.members"
                :key="member.id"
                type="button"
                @click="handleSelectMember(member.id)"
                class="w-full flex items-start gap-2.5 rounded-xl p-2 text-left transition border"
                :class="
                  authStore.currentUser.id === member.id
                    ? 'border-emerald-500/60 bg-emerald-500/10'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/60'
                "
              >
                <div
                  class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  :class="member.avatarColor"
                >
                  {{ member.avatarInitials }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center justify-between gap-1">
                    <span class="truncate text-xs font-semibold text-white">
                      {{ member.name }}
                    </span>
                    <span
                      class="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-emerald-300"
                    >
                      {{ member.rbacRole }}
                    </span>
                  </div>
                  <p class="font-mono text-[10px] text-slate-400">
                    {{ member.email }} • {{ member.controlNumber }}
                  </p>
                  <p class="mt-0.5 text-[10px] text-slate-300 line-clamp-2">
                    {{ member.permissionsSummary }}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <!-- Botón de restaurar datos semilla -->
        <button
          v-if="!authStore.isReadOnly"
          type="button"
          @click="scrumbanStore.resetToOfficialSeed"
          class="rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:border-slate-700 hover:text-white transition"
          title="Restaurar datos semilla oficiales de PARK FLOW (PF-5 a PF-24)"
        >
          <RotateCcw class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Modal de Confirmación para Completar Sprint (Exclusivo Haziel - ADMIN_PO_SM) -->
    <div
      v-if="scrumbanStore.isCompleteSprintModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div class="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
            <ShieldCheck class="h-6 w-6" />
          </div>
          <div>
            <h3 class="text-base font-bold text-white">
              Completar {{ sprintCompletionSummary.sprint.name.split('—')[0].trim() }}
            </h3>
            <p class="text-xs text-slate-400">
              Autorización verificada: <strong>{{ authStore.currentUser.name }}</strong> (`ADMIN_PO_SM`)
            </p>
          </div>
        </div>

        <div class="rounded-xl border border-slate-800 bg-slate-950 p-4 mb-4 space-y-3">
          <p class="text-xs text-slate-300">
            <strong>Meta del Sprint:</strong> {{ sprintCompletionSummary.sprint.goal }}
          </p>
          <div class="grid grid-cols-2 gap-3 pt-1">
            <div class="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <span class="text-[11px] font-semibold uppercase text-emerald-300">
                Historias Completadas (DONE)
              </span>
              <p class="mt-1 text-2xl font-extrabold text-white">
                {{ sprintCompletionSummary.completed.length }}
              </p>
              <p class="mt-1 font-mono text-[11px] text-emerald-200/80">
                {{
                  sprintCompletionSummary.completed.map((t) => t.key).join(', ') || 'Ninguna'
                }}
              </p>
            </div>
            <div class="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <span class="text-[11px] font-semibold uppercase text-amber-300">
                Pendientes a transferir
              </span>
              <p class="mt-1 text-2xl font-extrabold text-white">
                {{ sprintCompletionSummary.pending.length }}
              </p>
              <p class="mt-1 font-mono text-[11px] text-amber-200/80">
                Pasarán a: {{ sprintCompletionSummary.nextSprintLabel }}
              </p>
            </div>
          </div>
          <div
            v-if="sprintCompletionSummary.pending.length > 0"
            class="flex items-start gap-2 rounded-lg bg-slate-900 p-2.5 text-[11px] text-slate-300"
          >
            <AlertTriangle class="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              Las tareas pendientes (<strong>{{
                sprintCompletionSummary.pending.map((t) => t.key).join(', ')
              }}</strong>) actualizarán su identificador único <code>sprintId</code> hacia
              <strong>{{ sprintCompletionSummary.nextSprintLabel }}</strong> sin duplicar etiquetas de Sprint.
            </span>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2">
          <button
            type="button"
            @click="scrumbanStore.isCompleteSprintModalOpen = false"
            class="rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="button"
            @click="confirmCompleteSprint"
            class="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 class="h-4 w-4" />
            Confirmar Cierre de Sprint
          </button>
        </div>
      </div>
    </div>
  </header>
</template>
