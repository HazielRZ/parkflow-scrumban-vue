import type {
  ColumnDefinition,
  Epic,
  ErsRequirement,
  Sprint,
  Task,
  TeamMember
} from '@/types/scrumban'

export const COLUMNS_CONFIG: ColumnDefinition[] = [
  {
    id: 'BACKLOG',
    title: 'Backlog',
    subtitle: 'Product Backlog priorizado',
    wipLimit: null,
    accentColor: 'slate'
  },
  {
    id: 'TO_DO',
    title: 'Por hacer (Sprint)',
    subtitle: 'Comprometido en Sprint activo',
    wipLimit: null,
    accentColor: 'sky'
  },
  {
    id: 'IN_PROGRESS',
    title: 'En progreso',
    subtitle: 'Desarrollo activo (WIP Máx: 4)',
    wipLimit: 4,
    accentColor: 'amber'
  },
  {
    id: 'IN_REVIEW',
    title: 'En revisión / QA',
    subtitle: 'Code Review & Pruebas (WIP Máx: 3)',
    wipLimit: 3,
    accentColor: 'purple'
  },
  {
    id: 'DONE',
    title: 'Listo (Done)',
    subtitle: 'Validado contra criterios ERS',
    wipLimit: null,
    accentColor: 'emerald'
  }
]

export const TEAM_MEMBERS_SEED: TeamMember[] = [
  {
    id: 'member-haziel',
    name: 'Haziel Ruiz Zúñiga',
    controlNumber: '221213339',
    email: 'l221213339@morelia.tecnm.mx',
    projectRole: 'Product Owner / Scrum Master & Analista',
    rbacRole: 'ADMIN_PO_SM',
    avatarInitials: 'HR',
    avatarColor: 'bg-emerald-600 text-white ring-emerald-400',
    permissionsSummary:
      'Control total: único autorizado para crear, iniciar, editar o completar/cerrar Sprints, configurar límites WIP, gestionar el Product Backlog y administrar usuarios/invitados.'
  },
  {
    id: 'member-rodrigo',
    name: 'José Rodrigo Vargas Carrillo',
    controlNumber: '23121118',
    email: 'l23121118@morelia.tecnm.mx',
    projectRole: 'Tech Lead / Software Architect',
    rbacRole: 'TECH_LEAD',
    avatarInitials: 'JR',
    avatarColor: 'bg-indigo-600 text-white ring-indigo-400',
    permissionsSummary:
      'Crear/editar tareas técnicas, mover tarjetas en el tablero y aprobar Code Review (pasar de En revisión a Listo). No puede cerrar ni alterar Sprints.'
  },
  {
    id: 'member-miguel',
    name: 'Miguel Ángel Cristal Bolaños',
    controlNumber: '23121135',
    email: 'l23121135@morelia.tecnm.mx',
    projectRole: 'DevOps & QA Engineer',
    rbacRole: 'DEV_QA',
    avatarInitials: 'MC',
    avatarColor: 'bg-purple-600 text-white ring-purple-400',
    permissionsSummary:
      'Mover tareas asignadas hasta En revisión, validar pruebas de QA/latencia para paso a Listo y vincular PRs/commits. No puede cerrar ni alterar Sprints.'
  },
  {
    id: 'member-julio',
    name: 'Julio Armando Martínez Equihua',
    controlNumber: '23121112',
    email: 'l23121112@morelia.tecnm.mx',
    projectRole: 'Computer Vision & Backend Developer',
    rbacRole: 'DEVELOPER',
    avatarInitials: 'JM',
    avatarColor: 'bg-sky-600 text-white ring-sky-400',
    permissionsSummary:
      'Actualizar progreso de sus tareas (Por hacer -> En progreso -> En revisión), registrar subtareas, comentarios y ramas feature/PF-XX. No puede cerrar Sprints ni auto-aprobar Code Review.'
  },
  {
    id: 'member-luis',
    name: 'Luis Antonio Anzaldua Mendez',
    controlNumber: '24120432',
    email: 'l24121432@morelia.tecnm.mx',
    alternateEmails: ['l24120432@morelia.tecnm.mx', '24120432'],
    projectRole: 'Full-Stack & Frontend Developer',
    rbacRole: 'DEVELOPER',
    avatarInitials: 'LA',
    avatarColor: 'bg-amber-600 text-white ring-amber-400',
    permissionsSummary:
      'Actualizar progreso de sus tareas (Por hacer -> En progreso -> En revisión), registrar subtareas, comentarios y ramas feature/PF-XX. No puede cerrar Sprints ni auto-aprobar Code Review.'
  },
  {
    id: 'member-guest',
    name: 'Prof. Alma Lilia Núñez González / Invitado',
    controlNumber: 'Docente / Eval.',
    email: 'invitado@morelia.tecnm.mx',
    alternateEmails: ['evaluador@morelia.tecnm.mx', 'guest'],
    projectRole: 'Profesora Evaluadora (Ingeniería de Software) / Invitado',
    rbacRole: 'GUEST_VIEWER',
    avatarInitials: 'AN',
    avatarColor: 'bg-rose-600 text-white ring-rose-400',
    permissionsSummary:
      'Solo lectura estricta (Read-Only): visualizar tablero Scrumban, Backlog, Sprints, historial de auditoría, métricas (Lead/Cycle Time, Burndown) y trazabilidad con el ERS. Cero permisos de mutación.'
  }
]

export const ERS_REQUIREMENTS_SEED: ErsRequirement[] = [
  {
    code: 'INT-UI-01',
    category: 'Interfaz Usuario',
    name: 'Interfaz Web Móvil para Conductores (Estudiantes)',
    priority: 'Alta/Esencial',
    criteria:
      'Responsive, mapa de colores (Verde: Libre, Rojo: Ocupado, Amarillo: En maniobra), consulta en <= 3 pasos.',
    useCases: ['CU-01']
  },
  {
    code: 'INT-UI-02',
    category: 'Interfaz Usuario',
    name: 'Panel de Administración Operativa (Dashboard)',
    priority: 'Alta/Esencial',
    criteria:
      'Interfaz de escritorio con herramienta gráfica para dibujar/etiquetar polígonos sobre stream RTSP.',
    useCases: ['CU-02']
  },
  {
    code: 'INT-UI-03',
    category: 'Interfaz Usuario',
    name: 'Interfaz para Pantallas Informativas Físicas (LED)',
    priority: 'Media/Deseado',
    criteria:
      'Vista dinámica para paneles LED en entradas y bifurcaciones mostrando lugares libres por zona/piso.',
    useCases: ['CU-03']
  },
  {
    code: 'INT-HW-01',
    category: 'Interfaz Hardware',
    name: 'Interfaz con Cámaras IP de Video',
    priority: 'Alta/Esencial',
    criteria: 'Conexión en red con cámaras fijas en resolución HD mínima (720p a 1080p).'
  },
  {
    code: 'INT-HW-02',
    category: 'Interfaz Hardware',
    name: 'Interfaz con Sensores y Barreras de Acceso',
    priority: 'Media/Deseado',
    criteria:
      'Recepción de señal física de paso vehicular en plumas de entrada/salida para sincronizar aforo global.',
    useCases: ['CU-05']
  },
  {
    code: 'INT-SW-01',
    category: 'Interfaz Software',
    name: 'Integración con Pipeline de Visión Computacional',
    priority: 'Alta/Esencial',
    criteria:
      'API interna que recibe JSON con estados (Libre, Ocupado, En maniobra) por polígono desde YOLO/OpenCV.'
  },
  {
    code: 'INT-SW-02',
    category: 'Interfaz Software',
    name: 'Integración con Sistema de Base de Datos Relacional',
    priority: 'Alta/Esencial',
    criteria:
      'Persistencia relacional (PostgreSQL) de historial de ocupación, usuarios/credenciales y logs de acceso.'
  },
  {
    code: 'INT-COM-01',
    category: 'Comunicación',
    name: 'Protocolos RTSP y WebSockets / REST API',
    priority: 'Alta/Esencial',
    criteria:
      'RTSP continuo desde cámaras IP; WebSockets/REST hacia app móvil y paneles LED con latencia < 3 s.'
  },
  {
    code: 'RF-01',
    category: 'Funcional',
    name: 'Consulta de disponibilidad desde dispositivos móviles',
    priority: 'Alta/Esencial',
    criteria:
      'Visualización en tiempo real de cajones libres y ocupados desde celular o navegador (CU-01).',
    useCases: ['CU-01']
  },
  {
    code: 'RF-02',
    category: 'Funcional',
    name: 'Filtrado de disponibilidad por Campus y Turno',
    priority: 'Alta/Esencial',
    criteria:
      'Filtro por Campus 1 y Campus 2; detección automática de turno (Matutino/Vespertino) según hora (CU-01).',
    useCases: ['CU-01']
  },
  {
    code: 'RF-03',
    category: 'Funcional',
    name: 'Actualización y registro de cajones ocupados y libres',
    priority: 'Alta/Esencial',
    criteria:
      'Actualización automática por visión/sensores + sobrescritura manual para Administrador y Vigilancia (CU-02, CU-05).',
    useCases: ['CU-02', 'CU-05']
  },
  {
    code: 'RF-04',
    category: 'Funcional',
    name: 'Notificación automática de saturación (>= 90%)',
    priority: 'Media/Deseado',
    criteria:
      'Alerta destacada en app móvil y paneles LED ("ESTACIONAMIENTO CASI LLENO" / "LLENO") al llegar al 90% (CU-03).',
    useCases: ['CU-03']
  },
  {
    code: 'RF-05',
    category: 'Funcional',
    name: 'Generación de reportes analíticos de ocupación',
    priority: 'Media/Deseado',
    criteria:
      'Gráficas históricas por campus, turno, horas pico, estancia promedio y rotación, exportables a PDF/CSV (CU-04).',
    useCases: ['CU-04']
  },
  {
    code: 'RF-06',
    category: 'Funcional',
    name: 'Calibración y mapeo interactivo de cajones',
    priority: 'Alta/Esencial',
    criteria:
      'Herramienta gráfica sobre stream RTSP para delimitar, ajustar, numerar y guardar coordenadas poligonales (CU-02).',
    useCases: ['CU-02']
  },
  {
    code: 'RNF-01',
    category: 'Rendimiento',
    name: 'Tiempo de respuesta y latencia de actualización',
    priority: 'Alta/Esencial',
    criteria:
      'Respuesta en interfaz web/móvil <= 3 s; propagación del pipeline de visión computacional <= 5 s.'
  },
  {
    code: 'RNF-02',
    category: 'Seguridad',
    name: 'Autenticación institucional para la gestión',
    priority: 'Alta/Esencial',
    criteria:
      'Login obligatorio con correo @morelia.tecnm.mx y control de acceso basado en roles (RBAC).'
  },
  {
    code: 'RNF-03',
    category: 'Usabilidad',
    name: 'Navegación intuitiva en pocos pasos',
    priority: 'Alta/Esencial',
    criteria:
      'Consulta de disponibilidad accesible en máximo 3 pasos (clics o toques) desde la apertura de la app.'
  },
  {
    code: 'RNF-04',
    category: 'Disponibilidad',
    name: 'Disponibilidad operativa en horarios pico',
    priority: 'Alta/Esencial',
    criteria:
      'Uptime del 99% en horario matutino y vespertino (06:50 a 21:00 hrs), priorizando estabilidad en Campus 1.'
  },
  {
    code: 'RNF-05',
    category: 'Mantenibilidad',
    name: 'Arquitectura modular y facilidad de mantenimiento',
    priority: 'Media/Deseado',
    criteria: 'Separación estricta en 3 capas (/cv-service, /api-backend, /client-app).'
  },
  {
    code: 'RNF-06',
    category: 'Portabilidad',
    name: 'Compatibilidad móvil multiplataforma',
    priority: 'Media/Deseado',
    criteria: 'Compatibilidad total con navegadores móviles estándar en Android e iOS.'
  },
  {
    code: 'RNF-07',
    category: 'Precisión IA',
    name: 'Precisión del modelo de visión computacional',
    priority: 'Alta/Esencial',
    criteria:
      'Accuracy por cajón >= 95% en luz diurna natural y >= 90% en iluminación nocturna o lluvia moderada.'
  },
  {
    code: 'OT-01',
    category: 'Privacidad',
    name: 'Cumplimiento de Privacidad y Protección de Datos',
    priority: 'Alta/Esencial',
    criteria:
      'Prohibido almacenar/procesar rostros o seguir peatones; análisis exclusivo de presencia vehicular en polígonos.'
  }
]

export const EPICS_SEED: Epic[] = [
  {
    key: 'PF-5',
    moduleCode: 'EPIC-1',
    name: 'Arquitectura, DevOps y Base de Datos',
    description:
      'Definición de la arquitectura desacoplada en 3 capas (/cv-service, /api-backend, /client-app), infraestructura Docker, pipeline CI/CD y esquema PostgreSQL.',
    color: 'indigo',
    ersCodes: ['INT-SW-02', 'RNF-04', 'RNF-05'],
    useCases: [],
    layer: '/api-backend'
  },
  {
    key: 'PF-6',
    moduleCode: 'EPIC-2',
    name: 'Pipeline de Visión Computacional',
    description:
      'Ingesta de streams RTSP (720p/1080p), inferencia YOLO + OpenCV por polígonos respetando restricción ética OT-01 y emisión de estados JSON en <= 5 s.',
    color: 'cyan',
    ersCodes: ['INT-HW-01', 'INT-SW-01', 'RF-03', 'RNF-01', 'RNF-07', 'OT-01'],
    useCases: ['CU-02'],
    layer: '/cv-service'
  },
  {
    key: 'PF-7',
    moduleCode: 'EPIC-3',
    name: 'Backend, Tiempo Real y Control de Accesos',
    description:
      'Servidor FastAPI + WebSockets (< 3 s), autenticación institucional @morelia.tecnm.mx con RBAC, integración con barreras físicas y sobrescritura manual de vigilancia.',
    color: 'emerald',
    ersCodes: ['INT-COM-01', 'INT-HW-02', 'RF-03', 'RNF-01', 'RNF-02'],
    useCases: ['CU-02', 'CU-05'],
    layer: '/api-backend'
  },
  {
    key: 'PF-8',
    moduleCode: 'EPIC-4',
    name: 'App Web Móvil para Conductores',
    description:
      'PWA móvil accesible en <= 3 pasos con mapa cromático en tiempo real, detección automática de turno Matutino/Vespertino, filtro Campus 1/2 y alertas al >= 90%.',
    color: 'amber',
    ersCodes: ['INT-UI-01', 'RF-01', 'RF-02', 'RF-04', 'RNF-03', 'RNF-06'],
    useCases: ['CU-01', 'CU-03'],
    layer: '/client-app'
  },
  {
    key: 'PF-9',
    moduleCode: 'EPIC-5',
    name: 'Dashboard Administrativo, Calibración y Paneles LED',
    description:
      'Herramienta interactiva de dibujo y calibración de polígonos sobre RTSP, vista dinámica para pantallas físicas LED y reportes analíticos exportables a PDF y CSV.',
    color: 'purple',
    ersCodes: ['INT-UI-02', 'INT-UI-03', 'RF-03', 'RF-04', 'RF-05', 'RF-06'],
    useCases: ['CU-02', 'CU-03', 'CU-04'],
    layer: '/client-app'
  }
]

export const SPRINTS_SEED: Sprint[] = [
  {
    id: 'sprint-1',
    name: 'Sprint 1 — Cimientos, Arquitectura, Base de Datos y Motor CV Base',
    goal: 'Establecer la arquitectura modular de 3 capas, base de datos PostgreSQL, autenticación RBAC @morelia.tecnm.mx e ingesta RTSP + inferencia YOLO inicial sin captura facial (OT-01).',
    startDate: '2026-10-12',
    endDate: '2026-10-25',
    status: 'ACTIVE'
  },
  {
    id: 'sprint-2',
    name: 'Sprint 2 — Tiempo Real WebSockets, Sensores y App Móvil Conductores',
    goal: 'Conectar publicador JSON (< 5 s) con difusión WebSockets (< 3 s), sincronizar barreras/sobrescritura manual y lanzar PWA móvil en <= 3 pasos con filtro de Campus y Turno.',
    startDate: '2026-10-26',
    endDate: '2026-11-08',
    status: 'PLANNED'
  },
  {
    id: 'sprint-3',
    name: 'Sprint 3 — Calibración Poligonal, Alertas >= 90%, Paneles LED y Analítica PDF/CSV',
    goal: 'Entregar el editor gráfico de polígonos sobre RTSP, alertas de saturación >= 90%, vista para paneles LED físicos y módulo de reportes históricos exportables a PDF/CSV.',
    startDate: '2026-11-09',
    endDate: '2026-11-22',
    status: 'PLANNED'
  }
]

export const TASKS_SEED: Task[] = [
  {
    key: 'PF-10',
    epicKey: 'PF-5',
    title: 'Definir arquitectura modular desacoplada y contratos API JSON',
    description:
      'Establecer la separación estricta en 3 capas (/cv-service, /api-backend, /client-app) y especificar el esquema JSON de intercambio de estados (Libre, Ocupado, En maniobra) por polígono.',
    ersCodes: ['RNF-05', 'INT-SW-01'],
    useCases: [],
    assigneeId: 'member-rodrigo',
    sprintId: 'sprint-1',
    columnId: 'DONE',
    githubBranch: 'feature/PF-10-modular-architecture',
    pullRequestUrl: 'https://github.com/HazielRZ/park-flow/pull/10',
    storyPoints: 5,
    priority: 'Crítica',
    layer: '/api-backend',
    acceptanceCriteria: [
      'Estructura de directorios /cv-service, /api-backend y /client-app documentada y aislada.',
      'Contrato OpenAPI/JSON Schema validado para estados Libre, Ocupado y En maniobra.',
      'Aprobación de arquitectura por Product Owner y Tech Lead.'
    ],
    subtasks: [
      { id: 'PF-10-sub-1', title: 'Estructurar monorepo en 3 capas desacopladas', completed: true },
      { id: 'PF-10-sub-2', title: 'Definir payload JSON de inferencia por polígono', completed: true },
      { id: 'PF-10-sub-3', title: 'Documentar diagrama de componentes RNF-05', completed: true }
    ],
    comments: [
      {
        id: 'c-pf10-1',
        authorId: 'member-rodrigo',
        authorName: 'José Rodrigo Vargas Carrillo',
        authorRole: 'TECH_LEAD',
        content: 'Contratos JSON y estructura de 3 capas validados e integrados en rama principal.',
        createdAt: '2026-10-15T10:30:00-06:00'
      }
    ],
    leadTimeDays: 2.4,
    cycleTimeDays: 1.5,
    updatedAt: '2026-10-16T14:20:00-06:00'
  },
  {
    key: 'PF-11',
    epicKey: 'PF-5',
    title: 'Configurar repositorios, contenedores Docker y pipeline CI/CD inicial',
    description:
      'Crear archivos Dockerfile y docker-compose para levantar /cv-service, /api-backend, PostgreSQL y /client-app garantizando alta disponibilidad en horarios pico (06:50 a 21:00 hrs).',
    ersCodes: ['RNF-04', 'RNF-05'],
    useCases: [],
    assigneeId: 'member-miguel',
    sprintId: 'sprint-1',
    columnId: 'DONE',
    githubBranch: 'feature/PF-11-docker-cicd',
    pullRequestUrl: 'https://github.com/HazielRZ/park-flow/pull/11',
    storyPoints: 5,
    priority: 'Alta',
    layer: '/api-backend',
    acceptanceCriteria: [
      'Orquestación docker-compose funcional con healthchecks y reinicio automático.',
      'Pipeline de GitHub Actions ejecutando linting y pruebas automatizadas en cada PR.',
      'Configuración optimizada para uptime >= 99% en Campus 1 y Campus 2.'
    ],
    subtasks: [
      { id: 'PF-11-sub-1', title: 'Crear Dockerfiles multi-stage para Python y Node', completed: true },
      { id: 'PF-11-sub-2', title: 'Configurar workflow CI en GitHub Actions', completed: true },
      { id: 'PF-11-sub-3', title: 'Configurar políticas restart: always para RNF-04', completed: true }
    ],
    comments: [],
    leadTimeDays: 3.1,
    cycleTimeDays: 2.0,
    updatedAt: '2026-10-18T11:15:00-06:00'
  },
  {
    key: 'PF-12',
    epicKey: 'PF-5',
    title: 'Diseñar e implementar esquema de Base de Datos Relacional (ocupación, usuarios y logs)',
    description:
      'Modelar e implementar en PostgreSQL las tablas de campus, zonas, cajones (coordenadas poligonales), bitácora histórica de ocupación, usuarios institucionales y logs de auditoría.',
    ersCodes: ['INT-SW-02'],
    useCases: [],
    assigneeId: 'member-rodrigo',
    sprintId: 'sprint-1',
    columnId: 'IN_REVIEW',
    githubBranch: 'feature/PF-12-db-schema',
    pullRequestUrl: 'https://github.com/HazielRZ/park-flow/pull/12',
    storyPoints: 8,
    priority: 'Crítica',
    layer: '/api-backend',
    acceptanceCriteria: [
      'Migraciones SQL/Alembic ejecutables sin errores en PostgreSQL.',
      'Índices compuestos para consultas de historial por campus, zona y turno.',
      'Tabla de auditoría para sobrescrituras manuales y accesos RBAC.'
    ],
    subtasks: [
      { id: 'PF-12-sub-1', title: 'Definir DDL de tablas parking_spots, zones y campuses', completed: true },
      { id: 'PF-12-sub-2', title: 'Definir tablas users, roles y occupancy_history', completed: true },
      { id: 'PF-12-sub-3', title: 'Validar rendimiento de índices en pruebas de carga QA', completed: false }
    ],
    comments: [
      {
        id: 'c-pf12-1',
        authorId: 'member-miguel',
        authorName: 'Miguel Ángel Cristal Bolaños',
        authorRole: 'DEV_QA',
        content: 'Revisando PR #12: las migraciones corren limpio en contenedor PostgreSQL 16.',
        createdAt: '2026-10-21T16:40:00-06:00'
      }
    ],
    leadTimeDays: 4.0,
    cycleTimeDays: 2.8,
    updatedAt: '2026-10-21T16:40:00-06:00'
  },
  {
    key: 'PF-13',
    epicKey: 'PF-6',
    title: 'Implementar módulo de ingesta de video desde cámaras IP vía RTSP (720p/1080p)',
    description:
      'Desarrollar lector asíncrono de streams RTSP en OpenCV con reconexión automática, buffer sin acumulación de lag y soporte para resoluciones HD (720p y 1080p).',
    ersCodes: ['INT-HW-01', 'INT-COM-01', 'RNF-01'],
    useCases: [],
    assigneeId: 'member-julio',
    sprintId: 'sprint-1',
    columnId: 'IN_PROGRESS',
    githubBranch: 'feature/PF-13-rtsp-ingestion',
    storyPoints: 8,
    priority: 'Crítica',
    layer: '/cv-service',
    acceptanceCriteria: [
      'Conexión RTSP estable en 720p/1080p con descarte de frames obsoletos.',
      'Reconexión automática con backoff exponencial ante micro-cortes de red.',
      'Latencia de captura de frame inferior a 500 ms.'
    ],
    subtasks: [
      { id: 'PF-13-sub-1', title: 'Implementar RTSPStreamReader multihilo en Python', completed: true },
      { id: 'PF-13-sub-2', title: 'Integrar watchdog de reconexión automática', completed: true },
      { id: 'PF-13-sub-3', title: 'Probar stream continuo 1080p sin fuga de memoria', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-22T09:15:00-06:00'
  },
  {
    key: 'PF-14',
    epicKey: 'PF-6',
    title: 'Desarrollar inferencia YOLO + OpenCV por polígonos sin captura facial',
    description:
      'Implementar detección vehicular con YOLO y cálculo de intersección sobre polígonos calibrados (IoU) clasificando cada cajón en Libre, Ocupado o En maniobra, cumpliendo estrictamente OT-01 (cero almacenamiento facial o seguimiento peatonal).',
    ersCodes: ['RF-03', 'RNF-07', 'OT-01'],
    useCases: ['CU-02'],
    assigneeId: 'member-julio',
    sprintId: 'sprint-1',
    columnId: 'IN_PROGRESS',
    githubBranch: 'feature/PF-14-yolo-polygon-inference',
    storyPoints: 13,
    priority: 'Crítica',
    layer: '/cv-service',
    acceptanceCriteria: [
      'Clasificación en 3 estados: Libre, Ocupado y En maniobra por polígono.',
      'Cumplimiento estricto OT-01: filtrado exclusivo de clases vehiculares (car, motorcycle, truck, bus), ignorando personas y sin almacenar rostros.',
      'Accuracy >= 95% en luz diurna y >= 90% en condiciones nocturnas/lluvia moderada (RNF-07).'
    ],
    subtasks: [
      { id: 'PF-14-sub-1', title: 'Integrar pesos YOLO filtrando solo clases vehiculares (OT-01)', completed: true },
      { id: 'PF-14-sub-2', title: 'Implementar intersección poligonal con OpenCV pointPolygonTest', completed: false },
      { id: 'PF-14-sub-3', title: 'Agregar ventana temporal para estado En maniobra', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-22T10:05:00-06:00'
  },
  {
    key: 'PF-16',
    epicKey: 'PF-7',
    title: 'Implementar autenticación institucional (@morelia.tecnm.mx) y control de acceso RBAC',
    description:
      'Desarrollar middleware de autenticación JWT restringido al dominio institucional @morelia.tecnm.mx y guardias RBAC para diferenciar Administrador/PO, Tech Lead, DevOps/QA, Desarrolladores, Vigilancia e Invitados.',
    ersCodes: ['RNF-02'],
    useCases: [],
    assigneeId: 'member-rodrigo',
    sprintId: 'sprint-1',
    columnId: 'TO_DO',
    githubBranch: 'feature/PF-16-auth-rbac',
    storyPoints: 5,
    priority: 'Alta',
    layer: '/api-backend',
    acceptanceCriteria: [
      'Validación estricta de dominio institucional @morelia.tecnm.mx.',
      'Protección de endpoints administrativos y de calibración mediante RBAC.',
      'Registro en bitácora de auditoría por cada inicio de sesión y cambio de estado.'
    ],
    subtasks: [
      { id: 'PF-16-sub-1', title: 'Configurar validación de correo institucional @morelia.tecnm.mx', completed: false },
      { id: 'PF-16-sub-2', title: 'Implementar decoradores RBAC por rol en FastAPI', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-20T18:00:00-06:00'
  },
  {
    key: 'PF-15',
    epicKey: 'PF-6',
    title: 'Implementar emisión de estados JSON del motor de visión al backend (< 5 s) y validación de precisión',
    description:
      'Publicar cambios de estado detectados en /cv-service hacia /api-backend en formato JSON ligero en <= 5 segundos y ejecutar batería de pruebas de precisión diurna/nocturna.',
    ersCodes: ['INT-SW-01', 'RNF-01', 'RNF-07'],
    useCases: [],
    assigneeId: 'member-julio',
    sprintId: 'sprint-2',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-15-cv-json-publisher',
    storyPoints: 8,
    priority: 'Alta',
    layer: '/cv-service',
    acceptanceCriteria: [
      'Propagación de eventos JSON desde detección hasta API backend en <= 5 segundos (RNF-01).',
      'Reporte de matriz de confusión con accuracy >= 95% día y >= 90% noche/lluvia (RNF-07).'
    ],
    subtasks: [
      { id: 'PF-15-sub-1', title: 'Implementar cliente asíncrono emisor de deltas JSON', completed: false },
      { id: 'PF-15-sub-2', title: 'Ejecutar benchmark de latencia (< 5 s) y precisión IA', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T12:00:00-06:00'
  },
  {
    key: 'PF-17',
    epicKey: 'PF-7',
    title: 'Desarrollar servidor WebSockets y endpoints REST para difusión de aforo en tiempo real (< 3 s)',
    description:
      'Construir gestor de conexiones WebSockets por Campus y Zona en FastAPI para difundir instantáneamente cambios de disponibilidad hacia la PWA móvil y paneles LED en menos de 3 segundos.',
    ersCodes: ['INT-COM-01', 'RNF-01'],
    useCases: [],
    assigneeId: 'member-julio',
    sprintId: 'sprint-2',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-17-websockets-realtime',
    storyPoints: 8,
    priority: 'Crítica',
    layer: '/api-backend',
    acceptanceCriteria: [
      'Broadcast WebSockets a clientes suscritos en <= 3 segundos tras recibir actualización.',
      'Endpoint REST de snapshot inicial para carga instantánea al abrir la app.'
    ],
    subtasks: [
      { id: 'PF-17-sub-1', title: 'Crear ConnectionManager WebSockets segmentado por Campus', completed: false },
      { id: 'PF-17-sub-2', title: 'Implementar pruebas de estrés de latencia <= 3 s', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T12:10:00-06:00'
  },
  {
    key: 'PF-18',
    epicKey: 'PF-7',
    title: 'Implementar sincronización con sensores/barreras de acceso y sobrescritura manual para Vigilancia/Admin',
    description:
      'Integrar webhook/API para pulsos de sensores y plumas de acceso vehicular (INT-HW-02) y permitir que personal de Vigilancia o Administración fuerce manualmente el estado de un cajón por obras, reserva o emergencia (RF-03).',
    ersCodes: ['INT-HW-02', 'RF-03'],
    useCases: ['CU-02', 'CU-05'],
    assigneeId: 'member-julio',
    sprintId: 'sprint-2',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-18-barriers-manual-override',
    storyPoints: 8,
    priority: 'Alta',
    layer: '/api-backend',
    acceptanceCriteria: [
      'Recepción de eventos de entrada/salida desde barreras físicas actualizando conteo global.',
      'Sobrescritura manual con bloqueo temporal ante inferencia automática hasta liberación.',
      'Trazabilidad en logs con usuario y motivo del cambio manual (CU-02, CU-05).'
    ],
    subtasks: [
      { id: 'PF-18-sub-1', title: 'Desarrollar endpoint para pulsos de sensores/barreras INT-HW-02', completed: false },
      { id: 'PF-18-sub-2', title: 'Implementar lógica de lock manual para Vigilancia/Admin', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T12:20:00-06:00'
  },
  {
    key: 'PF-19',
    epicKey: 'PF-8',
    title: 'Construir interfaz web móvil responsive (PWA) con mapa de ocupación en tiempo real en <= 3 pasos',
    description:
      'Desarrollar aplicación web progresiva para estudiantes y conductores con mapa interactivo de cajones codificado por colores (Verde: Libre, Rojo: Ocupado, Amarillo: En maniobra) accesible en máximo 3 toques.',
    ersCodes: ['INT-UI-01', 'RF-01', 'RNF-03', 'RNF-06'],
    useCases: ['CU-01'],
    assigneeId: 'member-luis',
    sprintId: 'sprint-2',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-19-mobile-pwa-map',
    storyPoints: 8,
    priority: 'Crítica',
    layer: '/client-app',
    acceptanceCriteria: [
      'Visualización de disponibilidad de estacionamiento en <= 3 pasos desde apertura (RNF-03).',
      'Código de colores accesible: Verde (Libre), Rojo (Ocupado), Amarillo (En maniobra).',
      '100% compatible con navegadores móviles Android (Chrome) e iOS (Safari) (RNF-06).'
    ],
    subtasks: [
      { id: 'PF-19-sub-1', title: 'Diseñar mapa SVG interactivo de zonas de estacionamiento', completed: false },
      { id: 'PF-19-sub-2', title: 'Conectar cliente WebSocket con reconexión transparente', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T12:30:00-06:00'
  },
  {
    key: 'PF-20',
    epicKey: 'PF-8',
    title: 'Implementar detección automática de turno (Matutino/Vespertino) y filtrado por Campus 1 y Campus 2',
    description:
      'Preseleccionar automáticamente el turno activo según la hora del dispositivo (Matutino 06:50-14:00 / Vespertino 14:00-21:00) y ofrecer selector rápido entre Campus 1 y Campus 2 del TecNM Morelia.',
    ersCodes: ['RF-02'],
    useCases: ['CU-01'],
    assigneeId: 'member-luis',
    sprintId: 'sprint-2',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-20-campus-shift-filter',
    storyPoints: 5,
    priority: 'Alta',
    layer: '/client-app',
    acceptanceCriteria: [
      'Detección automática de turno Matutino o Vespertino al abrir la aplicación.',
      'Cambio instantáneo entre Campus 1 y Campus 2 persistiendo preferencia del conductor.'
    ],
    subtasks: [
      { id: 'PF-20-sub-1', title: 'Programar detector horario de turno Matutino/Vespertino', completed: false },
      { id: 'PF-20-sub-2', title: 'Crear barra de filtro rápido Campus 1 / Campus 2', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T12:40:00-06:00'
  },
  {
    key: 'PF-21',
    epicKey: 'PF-8',
    title: 'Implementar banners y notificaciones automáticas de saturación (>= 90%) en aplicación móvil',
    description:
      'Mostrar alerta visual prioritaria ("ESTACIONAMIENTO CASI LLENO" al >= 90% y "ESTACIONAMIENTO LLENO" al 100%) sugiriendo zonas o accesos alternos dentro del campus.',
    ersCodes: ['RF-04'],
    useCases: ['CU-03'],
    assigneeId: 'member-luis',
    sprintId: 'sprint-3',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-21-mobile-saturation-alert',
    storyPoints: 5,
    priority: 'Media',
    layer: '/client-app',
    acceptanceCriteria: [
      'Activación automática e inmediata del banner al alcanzar >= 90% de ocupación en una zona o campus.',
      'Recomendación dinámica de zonas alternas con lugares disponibles.'
    ],
    subtasks: [
      { id: 'PF-21-sub-1', title: 'Implementar componente SaturationBanner reactivo al umbral >= 90%', completed: false },
      { id: 'PF-21-sub-2', title: 'Integrar sugerencia automática de zona alterna libre', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T12:50:00-06:00'
  },
  {
    key: 'PF-22',
    epicKey: 'PF-9',
    title: 'Desarrollar herramienta gráfica interactiva en Dashboard para dibujo y calibración de polígonos sobre RTSP',
    description:
      'Construir editor en Canvas/SVG dentro del Dashboard administrativo para dibujar, mover vértices, etiquetar y guardar las coordenadas poligonales de cada cajón directamente sobre un frame del stream RTSP.',
    ersCodes: ['INT-UI-02', 'RF-06'],
    useCases: ['CU-02'],
    assigneeId: 'member-rodrigo',
    coAssigneeId: 'member-luis',
    sprintId: 'sprint-3',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-22-polygon-calibration-ui',
    storyPoints: 13,
    priority: 'Crítica',
    layer: '/client-app',
    acceptanceCriteria: [
      'Dibujo y edición de polígonos de 4+ vértices sobre imagen de referencia RTSP.',
      'Asignación de código de cajón, zona y exportación/guardado directo en PostgreSQL.',
      'Recarga en caliente de coordenadas en /cv-service sin reiniciar el contenedor.'
    ],
    subtasks: [
      { id: 'PF-22-sub-1', title: 'Desarrollar lienzo Canvas interactivo para trazado de vértices', completed: false },
      { id: 'PF-22-sub-2', title: 'Conectar guardado de coordenadas normalizadas con API Backend', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T13:00:00-06:00'
  },
  {
    key: 'PF-23',
    epicKey: 'PF-9',
    title: 'Construir vista dinámica para Pantallas Informativas Físicas (Paneles LED) con alertas de saturación',
    description:
      'Diseñar modo quiosco de alto contraste para paneles informativos físicos LED ubicados en accesos y bifurcaciones del campus, mostrando conteo de cajones libres por zona y alerta cuando la ocupación supere el 90%.',
    ersCodes: ['INT-UI-03', 'RF-04'],
    useCases: ['CU-03'],
    assigneeId: 'member-luis',
    sprintId: 'sprint-3',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-23-led-display-view',
    storyPoints: 5,
    priority: 'Media',
    layer: '/client-app',
    acceptanceCriteria: [
      'Tipografía de alta visibilidad a distancia y contraste optimizado para pantallas LED exteriores.',
      'Actualización automática vía WebSockets sin necesidad de recargar la página.',
      'Despliegue de alerta parpadeante de saturación al llegar al 90%.'
    ],
    subtasks: [
      { id: 'PF-23-sub-1', title: 'Diseñar layout de alto contraste para matriz LED', completed: false },
      { id: 'PF-23-sub-2', title: 'Sincronizar contadores por zona y alerta >= 90%', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T13:10:00-06:00'
  },
  {
    key: 'PF-24',
    epicKey: 'PF-9',
    title: 'Desarrollar módulo de reportes analíticos e históricos (horas pico, estancia, rotación) exportables a PDF y CSV',
    description:
      'Construir panel estadístico para dirección y administración con gráficas de ocupación por campus, turno, horas pico, tiempo promedio de estancia e índice de rotación vehicular, con exportación directa a PDF y CSV.',
    ersCodes: ['RF-05', 'INT-SW-02'],
    useCases: ['CU-04'],
    assigneeId: 'member-haziel',
    coAssigneeId: 'member-miguel',
    sprintId: 'sprint-3',
    columnId: 'BACKLOG',
    githubBranch: 'feature/PF-24-analytics-pdf-csv',
    storyPoints: 8,
    priority: 'Media',
    layer: '/client-app',
    acceptanceCriteria: [
      'Consultas agregadas por rango de fechas, Campus (1 y 2) y Turno (Matutino y Vespertino).',
      'Generación y descarga de reporte ejecutivo en formato PDF institucional y datos crudos en CSV (CU-04).'
    ],
    subtasks: [
      { id: 'PF-24-sub-1', title: 'Implementar endpoints de agregación histórica en FastAPI', completed: false },
      { id: 'PF-24-sub-2', title: 'Integrar generador de reportes PDF y exportador CSV', completed: false }
    ],
    comments: [],
    updatedAt: '2026-10-19T13:20:00-06:00'
  }
]
