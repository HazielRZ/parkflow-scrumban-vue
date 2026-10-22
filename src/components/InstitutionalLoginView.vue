<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  ShieldCheck,
  Eye,
  LogIn,
  Lock,
  Mail,
  Sparkles,
  AlertCircle,
  ArrowRight,
  KeyRound
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/useAuthStore'
import { useScrumbanStore } from '@/stores/useScrumbanStore'
import type { TeamMember } from '@/types/scrumban'

const authStore = useAuthStore()
const scrumbanStore = useScrumbanStore()
const router = useRouter()

const emailOrControl = ref('')
const passwordInput = ref('')
const localError = ref<string | null>(null)
const passwordFieldRef = ref<HTMLInputElement | null>(null)

const handleFormLogin = async () => {
  localError.value = null
  const result = await authStore.loginWithCredentials(emailOrControl.value, passwordInput.value)
  if (result.ok) {
    passwordInput.value = ''
    scrumbanStore.pushToast('success', 'Bienvenido a PARK FLOW Scrumban', result.message)
    await scrumbanStore.syncFromCloud(true)
    if (authStore.isReadOnly) {
      router.push('/guest')
    } else {
      router.push('/')
    }
  } else {
    localError.value = result.message
  }
}

/**
 * En producción: al seleccionar un integrante del equipo, únicamente se autocompleta
 * su correo institucional @morelia.tecnm.mx y se enfoca el campo de contraseña.
 * Solo el perfil GUEST_VIEWER entra directo sin contraseña.
 */
const handleSelectMemberCard = (member: TeamMember) => {
  localError.value = null
  if (member.rbacRole === 'GUEST_VIEWER') {
    handleGuestInstantAccess()
    return
  }
  emailOrControl.value = member.email
  passwordInput.value = ''
  passwordFieldRef.value?.focus()
}

const handleGuestInstantAccess = () => {
  localError.value = null
  authStore.enterGuestEvaluatorMode()
  scrumbanStore.syncFromCloud(true)
  scrumbanStore.pushToast(
    'info',
    'Modo Evaluador / Invitado Activo (/guest)',
    'Acceso de solo lectura estricta para la Prof. Alma Lilia Núñez González / Evaluadores.'
  )
  router.push('/guest')
}
</script>

<template>
  <div
    class="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 relative overflow-hidden"
  >
    <!-- Luces de fondo decorativas -->
    <div
      class="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl"
    />
    <div
      class="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl"
    />

    <!-- Barra Superior Institucional -->
    <header class="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md px-6 py-4 z-10">
      <div class="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-600 font-mono text-sm font-extrabold text-slate-950 shadow-lg shadow-emerald-500/20"
          >
            PF
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-base font-bold text-white tracking-tight">PARK FLOW</span>
              <span
                class="rounded-md bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-300 border border-emerald-500/30"
              >
                RNF-02 Auth &amp; RBAC
              </span>
            </div>
            <p class="text-xs text-slate-400">
              Instituto Tecnológico de Morelia • Ingeniería de Software (ERSIS2026 III)
            </p>
          </div>
        </div>

        <button
          type="button"
          @click="handleGuestInstantAccess"
          class="flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/15 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-500/25 transition shadow-lg shadow-rose-950/30"
        >
          <Eye class="h-4 w-4 text-rose-400" />
          <span>Vista Evaluador / Invitado (Solo Lectura)</span>
          <ArrowRight class="h-3.5 w-3.5" />
        </button>
      </div>
    </header>

    <!-- Contenedor Principal de Login -->
    <main class="relative z-10 mx-auto my-auto w-full max-w-6xl px-4 py-8">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <!-- Columna Izquierda: Formulario de Autenticación Institucional (@morelia.tecnm.mx) -->
        <div
          class="lg:col-span-5 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl"
        >
          <div class="mb-6">
            <div
              class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 mb-3"
            >
              <ShieldCheck class="h-3.5 w-3.5" />
              Autenticación Institucional TecNM Morelia
            </div>
            <h1 class="text-xl sm:text-2xl font-extrabold text-white">
              Iniciar Sesión en PARK FLOW
            </h1>
            <p class="mt-1 text-xs text-slate-400 leading-relaxed">
              Ingresa tu correo oficial <code class="text-emerald-300">@morelia.tecnm.mx</code> (o
              número de control) y tu contraseña personal para acceder con tus permisos RBAC.
            </p>
          </div>

          <form @submit.prevent="handleFormLogin" class="space-y-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                Correo Institucional o Número de Control
              </label>
              <div class="relative">
                <Mail class="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  v-model="emailOrControl"
                  type="text"
                  required
                  autocomplete="username"
                  placeholder="l221213339@morelia.tecnm.mx o 221213339"
                  class="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                Contraseña Institucional
              </label>
              <div class="relative">
                <Lock class="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  ref="passwordFieldRef"
                  v-model="passwordInput"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="Ingresa tu contraseña privada"
                  class="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <!-- Mensaje de error si la contraseña o el correo son inválidos -->
            <div
              v-if="localError"
              class="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-200"
            >
              <AlertCircle class="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{{ localError }}</span>
            </div>

            <button
              type="submit"
              :disabled="authStore.isAuthenticating"
              class="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-600/20 hover:from-emerald-500 hover:to-cyan-500 transition disabled:opacity-60"
            >
              <LogIn class="h-4 w-4" />
              <span>
                {{
                  authStore.isAuthenticating
                    ? 'Verificando credenciales...'
                    : 'Ingresar al Gestor Scrumban'
                }}
              </span>
            </button>
          </form>

          <!-- Separador para Acceso Directo de Evaluador / Profesora -->
          <div class="my-5 flex items-center gap-3">
            <div class="h-px flex-1 bg-slate-800" />
            <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Acceso Docente / Evaluación (Sin Contraseña)
            </span>
            <div class="h-px flex-1 bg-slate-800" />
          </div>

          <!-- Botón de Vista Evaluador / Invitado en < 1 segundo (Regla 5.3) -->
          <button
            type="button"
            @click="handleGuestInstantAccess"
            class="w-full flex items-center justify-between rounded-xl border border-rose-500/40 bg-rose-950/30 p-3.5 text-left hover:bg-rose-950/50 transition group"
          >
            <div class="flex items-center gap-3">
              <div
                class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300 font-bold text-xs"
              >
                <Eye class="h-4 w-4" />
              </div>
              <div>
                <p class="text-xs font-bold text-rose-200 group-hover:text-white">
                  Vista Evaluador / Invitado (Solo Lectura)
                </p>
                <p class="text-[11px] text-rose-300/80">
                  Prof. Alma Lilia Núñez González • Acceso directo `/guest` en &lt; 1 s
                </p>
              </div>
            </div>
            <ArrowRight class="h-4 w-4 text-rose-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        <!-- Columna Derecha: Directorio Oficial del Equipo PARK FLOW -->
        <div class="lg:col-span-7 space-y-4">
          <div class="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl">
            <div class="flex flex-wrap items-center justify-between gap-2 mb-4">
              <div>
                <h2 class="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Sparkles class="h-4 w-4 text-emerald-400" />
                  Directorio Oficial del Equipo PARK FLOW y Matriz RBAC
                </h2>
                <p class="text-xs text-slate-400">
                  Selecciona tu tarjeta para autocompletar tu correo institucional <code class="text-emerald-300">@morelia.tecnm.mx</code> e ingresa tu contraseña para iniciar sesión:
                </p>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                v-for="member in authStore.members"
                :key="member.id"
                type="button"
                @click="handleSelectMemberCard(member)"
                class="flex flex-col justify-between rounded-xl border p-3.5 text-left transition group"
                :class="
                  emailOrControl === member.email
                    ? 'border-emerald-500 bg-emerald-950/20'
                    : 'border-slate-800 bg-slate-950/80 hover:border-emerald-500/50 hover:bg-slate-900'
                "
              >
                <div>
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2.5">
                      <div
                        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2"
                        :class="member.avatarColor"
                      >
                        {{ member.avatarInitials }}
                      </div>
                      <div>
                        <p class="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                          {{ member.name }}
                        </p>
                        <p class="font-mono text-[10px] text-emerald-400">
                          {{ member.email }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div class="flex flex-wrap items-center gap-1.5 mb-2">
                    <span
                      class="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-300"
                    >
                      {{ member.rbacRole }}
                    </span>
                    <span class="font-mono text-[10px] text-slate-400">
                      No. Control: {{ member.controlNumber }}
                    </span>
                  </div>

                  <p class="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {{ member.permissionsSummary }}
                  </p>
                </div>

                <div
                  class="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-semibold"
                  :class="
                    member.rbacRole === 'GUEST_VIEWER' ? 'text-rose-300' : 'text-emerald-400'
                  "
                >
                  <span class="flex items-center gap-1">
                    <KeyRound v-if="member.rbacRole !== 'GUEST_VIEWER'" class="h-3 w-3" />
                    <Eye v-else class="h-3 w-3" />
                    {{
                      member.rbacRole === 'GUEST_VIEWER'
                        ? 'Entrar directo en Solo Lectura'
                        : 'Seleccionar correo (Requiere contraseña)'
                    }}
                  </span>
                  <ArrowRight class="h-3.5 w-3.5 group-hover:translate-x-1 transition" />
                </div>
              </button>
            </div>
          </div>

          <!-- Resumen de Reglas Operativas Protegidas -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <p class="text-xs font-bold text-emerald-400 mb-1">
                Protección Anti-Cierre de Sprint
              </p>
              <p class="text-[11px] text-slate-400">
                Únicamente <strong>Haziel Ruiz Zúñiga</strong> (`ADMIN_PO_SM`) puede iniciar o completar Sprints (validado en UI y Netlify Function).
              </p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <p class="text-xs font-bold text-amber-400 mb-1">
                Persistencia Cloud Netlify Blobs
              </p>
              <p class="text-[11px] text-slate-400">
                Todas las historias, Sprints y comentarios se guardan en la nube de Netlify ($0 MXN) para los 5 integrantes.
              </p>
            </div>
            <div class="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5">
              <p class="text-xs font-bold text-cyan-400 mb-1">
                Trazabilidad ERSIS2026 III
              </p>
              <p class="text-[11px] text-slate-400">
                5 Épicas (`PF-5` a `PF-9`), CRUD de tareas (`PF-10`+) y 22 Requisitos (`OT-01` incluido).
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Pie de página -->
    <footer class="border-t border-slate-900 bg-slate-950/90 py-3 px-6 text-center text-[11px] text-slate-500 z-10">
      <div class="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2">
        <span>PARK FLOW — Sistema Inteligente de Monitoreo de Estacionamiento por Visión Computacional</span>
        <span>TecNM Campus Morelia • Semestre Ago–Dic 2026</span>
      </div>
    </footer>
  </div>
</template>
