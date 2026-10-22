<script setup lang="ts">
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X
} from 'lucide-vue-next'
import NavbarSprintHeader from '@/components/NavbarSprintHeader.vue'
import TaskDetailModal from '@/components/TaskDetailModal.vue'
import { useScrumbanStore } from '@/stores/useScrumbanStore'

const scrumbanStore = useScrumbanStore()
</script>

<template>
  <div class="min-h-screen flex flex-col bg-slate-950 text-slate-100">
    <!-- Barra Superior de Sprint, RBAC y Navegación -->
    <NavbarSprintHeader />

    <!-- Contenido Principal (Tablero Scrumban o Matriz ERSIS2026 III) -->
    <main class="flex-1">
      <router-view />
    </main>

    <!-- Modal de Detalle de Tarea (PF-10 a PF-24) -->
    <TaskDetailModal />

    <!-- Sistema de Notificaciones Toast (Límites WIP, RBAC y Confirmaciones) -->
    <div
      class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0"
    >
      <div
        v-for="toast in scrumbanStore.toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md transition-all"
        :class="{
          'border-rose-500/60 bg-rose-950/95 text-rose-100': toast.type === 'error',
          'border-amber-500/60 bg-amber-950/95 text-amber-100': toast.type === 'warning',
          'border-emerald-500/60 bg-emerald-950/95 text-emerald-100': toast.type === 'success',
          'border-cyan-500/60 bg-slate-900/95 text-cyan-100': toast.type === 'info'
        }"
      >
        <AlertCircle
          v-if="toast.type === 'error'"
          class="h-5 w-5 text-rose-400 shrink-0 mt-0.5"
        />
        <AlertTriangle
          v-else-if="toast.type === 'warning'"
          class="h-5 w-5 text-amber-400 shrink-0 mt-0.5"
        />
        <CheckCircle2
          v-else-if="toast.type === 'success'"
          class="h-5 w-5 text-emerald-400 shrink-0 mt-0.5"
        />
        <Info v-else class="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />

        <div class="flex-1 min-w-0">
          <p class="text-xs font-bold">{{ toast.title }}</p>
          <p class="mt-0.5 text-[11px] leading-relaxed opacity-90">
            {{ toast.message }}
          </p>
        </div>

        <button
          type="button"
          @click="scrumbanStore.dismissToast(toast.id)"
          class="text-slate-400 hover:text-white"
        >
          <X class="h-4 w-4" />
        </button>
      </div>
    </div>

    <!-- Pie de página institucional -->
    <footer class="border-t border-slate-900 bg-slate-950/90 py-3 px-4 text-center text-[11px] text-slate-500">
      <div class="mx-auto max-w-[1600px] flex flex-wrap items-center justify-between gap-2">
        <span>
          <strong>PARK FLOW</strong> — Instituto Tecnológico de Morelia (Ingeniería en Sistemas Computacionales • Plan ISIC-2010-224)
        </span>
        <span>
          Ingeniería de Software — Evaluadora: <strong>Prof. Alma Lilia Núñez González</strong> • PO/SM: <strong>Haziel Ruiz Zúñiga</strong>
        </span>
      </div>
    </footer>
  </div>
</template>
