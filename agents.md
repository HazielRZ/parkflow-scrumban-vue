# AGENTS.md — Contexto Maestro de Spark y Especificación de PARK FLOW para Google Antigravity

Este archivo contiene el contexto completo de trabajo de **Haziel Ruiz Zúñiga (Spark)**, la especificación técnica y metodológica del proyecto **PARK FLOW** obtenida de la [Especificación de Requisitos de Software (ERSIS2026 III)](https://docs.google.com/document/d/1ooAwYElFUXKe86cURqn-KV1lSq0UJ2S8MSnUuNUcejA/edit?usp=drivesdk&ouid=113621385389315756514) y de la [Entrega de Metodología Scrumban, Jira y GitHub](https://docs.google.com/document/d/1vDMb63lpb5412eLXIvVr119whT10eLf96Zzi9xm5po0/edit?usp=drivesdk&ouid=113621385389315756514), así como la arquitectura en **Vue 3 + Netlify (Presupuesto $0)** para construir y desplegar el **Gestor Scrumban Propio de PARK FLOW** en sustitución de Jira Cloud.

## 1. Perfil del Desarrollador y Reglas Globales de Interacción (Contexto Spark)

* **Desarrollador Principal:** Haziel Ruiz Zúñiga (`l221213339@morelia.tecnm.mx` / GitHub: [HazielRZ](https://github.com/HazielRZ))
* **Perfil Académico:** Estudiante de 9º Semestre de Ingeniería en Sistemas Computacionales en el Instituto Tecnológico de Morelia (Plan ISIC-2010-224, semestre Agosto – Diciembre 2026).
* **Asignatura y Docente Evaluadora:** Ingeniería de Software — Prof. Alma Lilia Núñez González.
* **Rol en el Proyecto PARK FLOW:** Product Owner, Scrum Master y Analista de Software.
* **Estilo de Respuesta y Código Requerido:**
  * Mantener comunicación directa, estructurada, en español y con enfoque técnico de ingeniería de software.
  * Priorizar una aplicación web ultrarrápida (carga instantánea y transiciones optimistas sin la lentitud de Jira Cloud), 100% gratuita de operar ($0 MXN/USD) y lista para despliegue continuo en **Netlify**.
  * Conservar trazabilidad explícita hacia los códigos del ERS (`RF-XX`, `RNF-XX`, `INT-XX`, `OT-01`, `CU-XX`) y claves del proyecto (`PF-XX`) en modelos de datos, commits, ramas y vistas de interfaz.

## 2. Stack Tecnológico y Arquitectura del Gestor Scrumban (Vue 3 + Netlify — Costo $0)

Al generar o modificar código para el **Gestor Scrumban de PARK FLOW**, utiliza estrictamente este stack ligero y gratuito:

* **Frontend Framework:** **Vue 3** (Composition API con `<script setup lang="ts">`) + **Vite** para compilación instantánea ([Documentación de Vue 3](https://vuejs.org/guide/introduction.html)).
* **Gestión de Estado y Reglas Scrumban:** **Pinia** (`useScrumbanStore`, `useAuthStore`) con actualización optimista en UI para que mover tarjetas entre columnas sea inmediato (`0 ms` de latencia visual).
* **Estilos y UI:** **Tailwind CSS** + iconos `lucide-vue-next`, diseño oscuro/claro limpio, con Drag & Drop nativo HTML5 o `@vueuse/core` sin dependencias pesadas.
* **Hosting y Despliegue Continuo ($0):** **Netlify** conectado al repositorio de GitHub ([Configuración de `netlify.toml` en Netlify Docs](https://docs.netlify.com/configure-builds/file-based-configuration/)).
* **Persistencia y Backend Serverless ($0 — Dos modalidades soportadas):**
  1. **Modo Cloud Gratuito (Supabase Free Tier o Netlify Functions + Netlify Blobs / Neon Postgres):** Sincronización en tiempo real entre los 5 integrantes del equipo y políticas de seguridad en servidor (Row Level Security / Middleware RBAC) donde únicamente `l221213339@morelia.tecnm.mx` (`ADMIN_PO_SM`) tiene permiso de escritura sobre el estado de los Sprints.
  2. **Modo Fallback / Demo Local Instantáneo:** Si no se han configurado variables de entorno (`VITE_SUPABASE_URL`), el store de Pinia hidrata automáticamente los datos semilla (`PF-5` a `PF-24`) en `localStorage` con sincronización entre pestañas (`BroadcastChannel`), permitiendo probar y demostrar el sistema al instante tras clonar el repo.

### 2.1 Estructura de Directorios Requerida para el Proyecto en Antigravity

* `AGENTS.md`: Este archivo de reglas y contexto maestro para Google Antigravity.
* `netlify.toml`: Configuración de build (`npm run build`, `publish = "dist"`) y redirección SPA (`/* -> /index.html 200`).
* `src/types/scrumban.ts`: Interfaces TypeScript (`Role`, `TeamMember`, `Epic`, `Task`, `Sprint`, `ColumnId`, `ErsRequirement`).
* `src/data/parkflowSeed.ts`: Datos semilla oficiales de PARK FLOW (los 5 integrantes + rol Invitado/Profesora, los 22 requisitos del ERS, las 5 épicas `PF-5` a `PF-9`, las 15 tareas `PF-10` a `PF-24` y los 3 Sprints de 2 semanas).
* `src/stores/useAuthStore.ts`: Autenticación por correo institucional `@morelia.tecnm.mx`, selector rápido de rol para pruebas/evaluación y guardias de permisos RBAC.
* `src/stores/useScrumbanStore.ts`: Lógica del tablero, validación estricta de límites WIP (`IN_PROGRESS <= 4`, `IN_REVIEW <= 3`), validación de transición a `DONE` y bloqueo de cierre de Sprint.
* `src/components/`:
  * `NavbarSprintHeader.vue`: Barra superior con selector de Sprint activo, indicador de rol actual, acceso a modo Invitado (`Read-Only`) y botón **"Completar Sprint"** protegido por RBAC.
  * `ScrumbanBoard.vue`: Tablero de 5 columnas con contadores WIP en tiempo real y alertas visuales de cuello de botella.
  * `TaskCard.vue` y `TaskDetailModal.vue`: Tarjeta compacta con badges de clave `PF-XX`, códigos del ERS (`RF-XX`, `RNF-XX`), rama de GitHub (`feature/PF-XX-...`), responsable y puntos de historia.
  * `ErsTraceabilityView.vue`: Matriz interactiva de trazabilidad que cruza los requisitos del `ERSIS2026 III` contra el avance real de las tareas `PF-10` a `PF-24`.

### 2.2 Configuración Base de `netlify.toml`

Incluir siempre en la raíz del proyecto el archivo `netlify.toml` con la configuración estándar de SPA para Vue 3 + Vite:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 3. Contexto del Producto Gestionado: Sistema PARK FLOW

* **Nombre Oficial:** PARK FLOW — Sistema Inteligente de Monitoreo y Gestión de Estacionamiento por Visión Computacional.
* **Repositorio Principal:** [github.com/HazielRZ/park-flow](https://github.com/HazielRZ/park-flow)
* **Propósito:** Automatizar la detección y gestión en tiempo real del estado de ocupación (`Libre`, `Ocupado`, `En maniobra`) de cajones de estacionamiento mediante procesamiento de video de cámaras fijas IP (RTSP), optimizando el flujo vehicular interno y de acceso en el Instituto Tecnológico de Morelia (Campus 1 y Campus 2, turnos Matutino y Vespertino) y ofreciendo paneles para conductores (app web móvil/PWA y pantallas LED) y personal administrativo/vigilancia.
* **Restricción Ética y Legal Crítica (`OT-01`):** Prohibido almacenar o procesar grabaciones faciales de transeúntes o conductores, así como realizar seguimiento invasivo de peatones. El procesamiento de video se limita exclusivamente a detectar la presencia física de vehículos dentro de los polígonos calibrados.

### 3.1 Arquitectura Modular del Sistema PARK FLOW (`RNF-05`)

| Capa / Servicio | Directorio | Stack Tecnológico | Responsabilidades Clave y SLAs |
| :--- | :--- | :--- | :--- |
| **Motor de Visión Computacional** | `/cv-service` | Python 3.10+, YOLO, OpenCV, RTSP | Ingesta de streams RTSP en HD (720p/1080p), inferencia por polígonos (`Libre`, `Ocupado`, `En maniobra`) sin captura facial (`OT-01`), precisión >= 95% día y >= 90% noche/lluvia (`RNF-07`), propagación JSON en <= 5 s (`RNF-01`). |
| **Servidor Backend y Tiempo Real** | `/api-backend` | Python, FastAPI, PostgreSQL, WebSockets | Estado global de aforo, autenticación institucional `@morelia.tecnm.mx` con RBAC (`RNF-02`), integración con sensores/barreras (`INT-HW-02`), sobrescritura manual de vigilancia (`RF-03`) y difusión WebSockets en <= 3 s (`RNF-01`). |
| **Frontend Web, Móvil y Señalización** | `/client-app` | Node.js 18+, Web Responsive / PWA | App móvil para estudiantes accesible en <= 3 pasos (`RNF-03`) con filtro automático de turno y Campus 1/2 (`RF-02`), alertas al >= 90% de ocupación (`RF-04`), vista para paneles LED (`INT-UI-03`) y Dashboard administrativo con editor interactivo de polígonos (`RF-06`) y reportes PDF/CSV (`RF-05`). |

## 4. Equipo del Proyecto y Matriz de Roles (RBAC)

El gestor Scrumban en Vue 3 debe aplicar este Control de Acceso Basado en Roles (RBAC) tanto en las acciones de Pinia/UI como en las reglas de base de datos/funciones serverless para evitar que invitados o roles no autorizados cierren o alteren Sprints.

| Nombre Completo | No. Control | Correo Institucional | Rol en Proyecto / Scrumban | Rol en el Gestor (RBAC) | Permisos en el Gestor Scrumban Propio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Haziel Ruiz Zúñiga** | 221213339 | `l221213339@morelia.tecnm.mx` | Product Owner / Scrum Master & Analista | `ADMIN_PO_SM` | **Control total:** único autorizado para crear, iniciar, editar o **completar/cerrar Sprints**, configurar límites WIP, gestionar el Product Backlog y administrar usuarios/invitados. |
| **José Rodrigo Vargas Carrillo** | 23121118 | `l23121118@morelia.tecnm.mx` | Tech Lead / Software Architect | `TECH_LEAD` | Crear/editar tareas técnicas, mover tarjetas en el tablero, **aprobar Code Review** (pasar de `En revisión` a `Listo`). **No puede cerrar ni alterar Sprints.** |
| **Miguel Ángel Cristal Bolaños** | 23121135 | `l23121135@morelia.tecnm.mx` | DevOps & QA Engineer | `DEV_QA` | Mover tareas asignadas hasta `En revisión`, validar pruebas de QA/latencia para paso a `Listo`, vincular PRs/commits. **No puede cerrar ni alterar Sprints.** |
| **Julio Armando Martínez Equihua** | 23121112 | `l23121112@morelia.tecnm.mx` | Computer Vision & Backend Developer | `DEVELOPER` | Actualizar progreso de sus tareas (`Por hacer` -> `En progreso` -> `En revisión`), registrar subtareas, comentarios y ramas `feature/PF-XX`. **No puede cerrar Sprints ni auto-aprobar Code Review.** |
| **Luis Antonio Anzaldua Mendez** | 24120432 | `l24121432@morelia.tecnm.mx` | Full-Stack & Frontend Developer | `DEVELOPER` | Actualizar progreso de sus tareas (`Por hacer` -> `En progreso` -> `En revisión`), registrar subtareas, comentarios y ramas `feature/PF-XX`. **No puede cerrar Sprints ni auto-aprobar Code Review.** |
| **Alma Lilia Núñez González / Invitados** | Docente / Eval. | Invitado o enlace `/guest` | Profesora Evaluadora (Ingeniería de Software) / Invitado | `GUEST_VIEWER` | **Solo lectura estricta (`Read-Only`):** visualizar tablero Scrumban, Backlog, Sprints, historial de auditoría, métricas (Lead/Cycle Time, Burndown) y trazabilidad con el ERS. **Cero permisos de mutación.** |

*(Nota: Para Luis Antonio Anzaldua Mendez, aceptar tanto `l24120432@morelia.tecnm.mx` como su número de control `24120432` registrado en el ERS).*

## 5. Reglas Operativas del Tablero Scrumban (Reemplazo de Jira)

Para garantizar el apego metodológico documentado en la [Entrega de Metodología Scrumban](https://docs.google.com/document/d/1vDMb63lpb5412eLXIvVr119whT10eLf96Zzi9xm5po0/edit?usp=drivesdk&ouid=113621385389315756514) y corregir los problemas de lentitud y permisos de Jira Cloud:

1. **Flujo de Columnas y Límites WIP (Work In Progress):**
   * `BACKLOG`: Historias y tareas priorizadas pendientes de asignación a un Sprint.
   * `TO_DO` (**Por hacer - Sprint**): Tareas comprometidas en el Sprint activo de 2 semanas (sin límite WIP).
   * `IN_PROGRESS` (**En progreso**): Límite estricto de **WIP Máximo = 4 tareas**. El store de Pinia y el backend deben bloquear cualquier transición a esta columna si ya existen 4 tareas activas, mostrando un toast explicativo del límite WIP, salvo override explícito de `ADMIN_PO_SM`.
   * `IN_REVIEW` (**En revisión / Code Review & QA**): Límite estricto de **WIP Máximo = 3 tareas**. Requiere enlace a rama (`feature/PF-XX-...`) o Pull Request en GitHub.
   * `DONE` (**Listo**): Solo `ADMIN_PO_SM`, `TECH_LEAD` o `DEV_QA` pueden mover una tarjeta de `IN_REVIEW` a `DONE` tras validar criterios de aceptación y pruebas.
2. **Protección de Sprints (Anti-Cierre Accidental):**
   * Las acciones `startSprint()`, `completeSprint()` y `updateSprint()` en `useScrumbanStore.ts` (y las políticas RLS/endpoints) deben verificar que `currentUser.role === 'ADMIN_PO_SM'`.
   * En la interfaz Vue, el botón **"Completar Sprint"** debe ocultarse o mostrarse con candado deshabilitado para todos los roles excepto Haziel (`ADMIN_PO_SM`), e incluir un modal de confirmación con resumen de historias completadas vs. pendientes que pasarán al siguiente Sprint.
   * El campo `sprintId` de cada tarea debe ser un identificador único escalar (`'sprint-1'`, `'sprint-2'`, `'sprint-3'` o `null`), impidiendo que una tarea acumule etiquetas repetidas como `SCRUM Sprint 1, SCRUM Sprint 1`.
3. **Modo Vista de Evaluador / Invitado Instantáneo (`/guest`):**
   * Incluir una ruta en Vue Router (`/guest`) y un botón de acceso rápido **"Vista Evaluador / Invitado (Solo Lectura)"** en la pantalla de login para que la profesora Alma Lilia Núñez González o invitados inspeccionen el tablero, los filtros por épica y la matriz del ERS en menos de 1 segundo sin poder arrastrar tarjetas ni cerrar sprints.

## 6. Catálogo Completo de Requisitos del ERS (`ERSIS2026 III`)

Cada tarjeta `PF-XX` en el gestor debe poder vincularse a uno o más de estos códigos oficiales:

| Código | Categoría | Nombre del Requisito | Prioridad | Criterio Técnico / Métrica Clave |
| :--- | :--- | :--- | :--- | :--- |
| **INT-UI-01** | Interfaz Usuario | Interfaz Web Móvil para Conductores (Estudiantes) | Alta/Esencial | Responsive, mapa de colores (Verde: Libre, Rojo: Ocupado, Amarillo: En maniobra), consulta en <= 3 pasos. |
| **INT-UI-02** | Interfaz Usuario | Panel de Administración Operativa (Dashboard) | Alta/Esencial | Interfaz de escritorio con herramienta gráfica para dibujar/etiquetar polígonos sobre stream RTSP. |
| **INT-UI-03** | Interfaz Usuario | Interfaz para Pantallas Informativas Físicas (LED) | Media/Deseado | Vista dinámica para paneles LED en entradas y bifurcaciones mostrando lugares libres por zona/piso. |
| **INT-HW-01** | Interfaz Hardware | Interfaz con Cámaras IP de Video | Alta/Esencial | Conexión en red con cámaras fijas en resolución HD mínima (720p a 1080p). |
| **INT-HW-02** | Interfaz Hardware | Interfaz con Sensores y Barreras de Acceso | Media/Deseado | Recepción de señal física de paso vehicular en plumas de entrada/salida para sincronizar aforo global. |
| **INT-SW-01** | Interfaz Software | Integración con Pipeline de Visión Computacional | Alta/Esencial | API interna que recibe JSON con estados (`Libre`, `Ocupado`, `En maniobra`) por polígono desde YOLO/OpenCV. |
| **INT-SW-02** | Interfaz Software | Integración con Sistema de Base de Datos Relacional | Alta/Esencial | Persistencia relacional (PostgreSQL) de historial de ocupación, usuarios/credenciales y logs de acceso. |
| **INT-COM-01** | Comunicación | Protocolos RTSP y WebSockets / REST API | Alta/Esencial | RTSP continuo desde cámaras IP; WebSockets/REST hacia app móvil y paneles LED con latencia < 3 s. |
| **RF-01** | Funcional | Consulta de disponibilidad desde dispositivos móviles | Alta/Esencial | Visualización en tiempo real de cajones libres y ocupados desde celular o navegador (`CU-01`). |
| **RF-02** | Funcional | Filtrado de disponibilidad por Campus y Turno | Alta/Esencial | Filtro por Campus 1 y Campus 2; detección automática de turno (Matutino/Vespertino) según hora (`CU-01`). |
| **RF-03** | Funcional | Actualización y registro de cajones ocupados y libres | Alta/Esencial | Actualización automática por visión/sensores + sobrescritura manual para Administrador y Vigilancia (`CU-02`, `CU-05`). |
| **RF-04** | Funcional | Notificación automática de saturación (>= 90%) | Media/Deseado | Alerta destacada en app móvil y paneles LED ("ESTACIONAMIENTO CASI LLENO" / "LLENO") al llegar al 90% (`CU-03`). |
| **RF-05** | Funcional | Generación de reportes analíticos de ocupación | Media/Deseado | Gráficas históricas por campus, turno, horas pico, estancia promedio y rotación, exportables a PDF/CSV (`CU-04`). |
| **RF-06** | Funcional | Calibración y mapeo interactivo de cajones | Alta/Esencial | Herramienta gráfica sobre stream RTSP para delimitar, ajustar, numerar y guardar coordenadas poligonales (`CU-02`). |
| **RNF-01** | Rendimiento | Tiempo de respuesta y latencia de actualización | Alta/Esencial | Respuesta en interfaz web/móvil <= 3 s; propagación del pipeline de visión computacional <= 5 s. |
| **RNF-02** | Seguridad | Autenticación institucional para la gestión | Alta/Esencial | Login obligatorio con correo `@morelia.tecnm.mx` y control de acceso basado en roles (RBAC). |
| **RNF-03** | Usabilidad | Navegación intuitiva en pocos pasos | Alta/Esencial | Consulta de disponibilidad accesible en máximo 3 pasos (clics o toques) desde la apertura de la app. |
| **RNF-04** | Disponibilidad | Disponibilidad operativa en horarios pico | Alta/Esencial | Uptime del 99% en horario matutino y vespertino (06:50 a 21:00 hrs), priorizando estabilidad en Campus 1. |
| **RNF-05** | Mantenibilidad | Arquitectura modular y facilidad de mantenimiento | Media/Deseado | Separación estricta en 3 capas (`/cv-service`, `/api-backend`, `/client-app`). |
| **RNF-06** | Portabilidad | Compatibilidad móvil multiplataforma | Media/Deseado | Compatibilidad total con navegadores móviles estándar en Android e iOS. |
| **RNF-07** | Precisión IA | Precisión del modelo de visión computacional | Alta/Esencial | Accuracy por cajón >= 95% en luz diurna natural y >= 90% en iluminación nocturna o lluvia moderada. |
| **OT-01** | Privacidad | Cumplimiento de Privacidad y Protección de Datos | Alta/Esencial | Prohibido almacenar/procesar rostros o seguir peatones; análisis exclusivo de presencia vehicular en polígonos. |

## 7. Datos Semilla (Seed Data): Épicas (`PF-5` a `PF-9`) y Backlog (`PF-10` a `PF-24`)

Al inicializar `src/data/parkflowSeed.ts` en la aplicación Vue 3, precargar las siguientes **5 Épicas** y las **15 Historias/Tareas** del proyecto:

### 7.1 Épicas del Proyecto (`PF-5` a `PF-9`)

| Clave | Código Modular | Nombre de la Épica | Requisitos y Casos de Uso Trazados |
| :--- | :--- | :--- | :--- |
| **PF-5** | `EPIC-1` | Arquitectura, DevOps y Base de Datos | `INT-SW-02`, `RNF-04`, `RNF-05` |
| **PF-6** | `EPIC-2` | Pipeline de Visión Computacional | `INT-HW-01`, `INT-SW-01`, `RF-03`, `RNF-01`, `RNF-07`, `OT-01`, `CU-02` |
| **PF-7** | `EPIC-3` | Backend, Tiempo Real y Control de Accesos | `INT-COM-01`, `INT-HW-02`, `RF-03`, `RNF-01`, `RNF-02`, `CU-02`, `CU-05` |
| **PF-8** | `EPIC-4` | App Web Móvil para Conductores | `INT-UI-01`, `RF-01`, `RF-02`, `RF-04`, `RNF-03`, `RNF-06`, `CU-01`, `CU-03` |
| **PF-9** | `EPIC-5` | Dashboard Administrativo, Calibración y Paneles LED | `INT-UI-02`, `INT-UI-03`, `RF-03`, `RF-04`, `RF-05`, `RF-06`, `CU-02`, `CU-03`, `CU-04` |

### 7.2 Historias y Tareas del Product Backlog y Sprints (`PF-10` a `PF-24`)

| Clave | Épica | Título de la Tarea / Historia | Requisitos ERS | Responsable Sugerido | Sprint | Rama GitHub Asociada |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **PF-10** | `PF-5` | Definir arquitectura modular desacoplada y contratos API JSON | `RNF-05`, `INT-SW-01` | José Rodrigo Vargas Carrillo (`Tech Lead`) | Sprint 1 | `feature/PF-10-modular-architecture` |
| **PF-11** | `PF-5` | Configurar repositorios, contenedores Docker y pipeline CI/CD inicial | `RNF-04`, `RNF-05` | Miguel Ángel Cristal Bolaños (`DevOps & QA`) | Sprint 1 | `feature/PF-11-docker-cicd` |
| **PF-12** | `PF-5` | Diseñar e implementar esquema de Base de Datos Relacional (ocupación, usuarios y logs) | `INT-SW-02` | José Rodrigo Vargas Carrillo (`Tech Lead`) | Sprint 1 | `feature/PF-12-db-schema` |
| **PF-13** | `PF-6` | Implementar módulo de ingesta de video desde cámaras IP vía RTSP (720p/1080p) | `INT-HW-01`, `INT-COM-01`, `RNF-01` | Julio Armando Martínez Equihua (`CV & Backend`) | Sprint 1 | `feature/PF-13-rtsp-ingestion` |
| **PF-14** | `PF-6` | Desarrollar inferencia YOLO + OpenCV por polígonos sin captura facial | `RF-03`, `RNF-07`, `OT-01` | Julio Armando Martínez Equihua (`CV & Backend`) | Sprint 1 | `feature/PF-14-yolo-polygon-inference` |
| **PF-15** | `PF-6` | Implementar emisión de estados JSON del motor de visión al backend (< 5 s) y validación de precisión | `INT-SW-01`, `RNF-01`, `RNF-07` | Julio Armando Martínez Equihua (`CV & Backend`) | Sprint 2 | `feature/PF-15-cv-json-publisher` |
| **PF-16** | `PF-7` | Implementar autenticación institucional (`@morelia.tecnm.mx`) y control de acceso RBAC | `RNF-02` | José Rodrigo Vargas Carrillo (`Tech Lead`) | Sprint 1 | `feature/PF-16-auth-rbac` |
| **PF-17** | `PF-7` | Desarrollar servidor WebSockets y endpoints REST para difusión de aforo en tiempo real (< 3 s) | `INT-COM-01`, `RNF-01` | Julio Armando Martínez Equihua (`CV & Backend`) | Sprint 2 | `feature/PF-17-websockets-realtime` |
| **PF-18** | `PF-7` | Implementar sincronización con sensores/barreras de acceso y sobrescritura manual para Vigilancia/Admin | `INT-HW-02`, `RF-03`, `CU-02`, `CU-05` | Julio Armando Martínez Equihua (`CV & Backend`) | Sprint 2 | `feature/PF-18-barriers-manual-override` |
| **PF-19** | `PF-8` | Construir interfaz web móvil responsive (PWA) con mapa de ocupación en tiempo real en <= 3 pasos | `INT-UI-01`, `RF-01`, `RNF-03`, `RNF-06`, `CU-01` | Luis Antonio Anzaldua Mendez (`Frontend`) | Sprint 2 | `feature/PF-19-mobile-pwa-map` |
| **PF-20** | `PF-8` | Implementar detección automática de turno (Matutino/Vespertino) y filtrado por Campus 1 y Campus 2 | `RF-02`, `CU-01` | Luis Antonio Anzaldua Mendez (`Frontend`) | Sprint 2 | `feature/PF-20-campus-shift-filter` |
| **PF-21** | `PF-8` | Implementar banners y notificaciones automáticas de saturación (>= 90%) en aplicación móvil | `RF-04`, `CU-03` | Luis Antonio Anzaldua Mendez (`Frontend`) | Sprint 3 | `feature/PF-21-mobile-saturation-alert` |
| **PF-22** | `PF-9` | Desarrollar herramienta gráfica interactiva en Dashboard para dibujo y calibración de polígonos sobre RTSP | `INT-UI-02`, `RF-06`, `CU-02` | José Rodrigo Vargas Carrillo & Luis Antonio Anzaldua | Sprint 3 | `feature/PF-22-polygon-calibration-ui` |
| **PF-23** | `PF-9` | Construir vista dinámica para Pantallas Informativas Físicas (Paneles LED) con alertas de saturación | `INT-UI-03`, `RF-04`, `CU-03` | Luis Antonio Anzaldua Mendez (`Frontend`) | Sprint 3 | `feature/PF-23-led-display-view` |
| **PF-24** | `PF-9` | Desarrollar módulo de reportes analíticos e históricos (horas pico, estancia, rotación) exportables a PDF y CSV | `RF-05`, `INT-SW-02`, `CU-04` | Haziel Ruiz Zúñiga & Miguel Ángel Cristal | Sprint 3 | `feature/PF-24-analytics-pdf-csv` |
