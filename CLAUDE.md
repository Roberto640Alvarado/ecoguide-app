@AGENTS.md

# CLAUDE.md

Este archivo proporciona lineamientos para Claude Code (claude.ai/code) al trabajar sobre este repositorio.

## Reglas

- Nunca incluir "Co-Authored-By", "Anthropic", "Claude" o "Claude Code" en mensajes de commit ni en ninguna salida relacionada con Git.
- Cada vez que completes un task, muestra un emoji de cohete 🚀 al final del mensaje.

---

# Descripción del Proyecto

EcoGuide Training App es el frontend (Next.js) de la plataforma educativa EcoGuide, enfocada en el aprendizaje del idioma inglés aplicado al ecoturismo en El Salvador.

Este proyecto consume la API REST **EcoGuide Training API** (NestJS + MongoDB + Prisma, repositorio hermano `ecoguide-api`). El frontend no tiene base de datos propia ni lógica de negocio: toda la validación real, autorización y persistencia vive en la API. Aquí solo se construyen las vistas, el estado de cliente y la orquestación de llamadas HTTP.

La plataforma permitirá que los estudiantes recorran áreas protegidas, estudien contenido educativo (flashcards), practiquen pronunciación mediante Inteligencia Artificial, conversen con un chatbot especializado, completen evaluaciones y lleven el seguimiento de su progreso.

Los docentes podrán administrar completamente el contenido de la plataforma desde un panel administrativo, incluyendo áreas protegidas, flashcards, prácticas de speaking, chatbot, evaluaciones, estudiantes y configuraciones de modelos de IA.

---

## Commands

```bash
npm run dev                # Desarrollo (Next.js dev server)
npm run build               # Compilar proyecto
npm run start                # Servir build de producción
npm run lint                 # ESLint
```

---

# Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict)
- Tailwind CSS v4
- HeroUI (`@heroui/react`, `@heroui/theme`, `@heroui/system`) — librería de componentes
- Framer Motion — animaciones (usada internamente por HeroUI también)
- TanStack React Query — data fetching, cache, mutaciones contra la API
- TanStack React Table — tablas del panel de TEACHER (Users, ProtectedAreas, FlashCards, AIProviders)
- React Hook Form + Zod + `@hookform/resolvers` — formularios y validación, en espejo de los DTOs de la API
- Axios — cliente HTTP (instancia única con interceptor de auth)
- Zustand — estado de cliente que no vive en la API (UI state, no cache de servidor)
- nuqs — sincroniza filtros de listados (`page`, `limit`, `search`, `sort`) con la URL
- Embla Carousel — carrusel de flashcards
- input-otp — código de recuperación de contraseña (6 dígitos)
- Lucide React — iconos
- next-themes — modo claro/oscuro
- nextjs-toploader — barra de progreso de navegación
- DOMPurify — sanitizar contenido/HTML antes de renderizarlo (respuestas del chatbot)
- Lottie React / driver.js — animaciones ilustrativas y onboarding guiado
- Recharts — gráficas (Dashboard, StudentProgress; a futuro)
- Vaul / cmdk — drawer móvil y command palette

No se usa: NextAuth (auth propia contra el JWT de la API — ver sección Autenticación), mapas (por ahora ProtectedAreas se maneja sin mapa visual), SWR ni dayjs (redundantes con react-query y date-fns respectivamente).

---

# Arquitectura

Next.js App Router. El grupo `(auth)` (login/registro/recuperación) no agrega segmento a la URL porque sus rutas son únicas. `student` y `teacher` **son carpetas literales** (no route groups): ambos roles comparten nombres de sección (`protected-areas`, `flash-cards`), y un route group no le añade prefijo a la URL, así que dos grupos con la misma subruta colisionarían en `/protected-areas`. Por eso cada rol vive bajo su propio segmento real (`/student/...`, `/teacher/...`), lo que además simplifica el `middleware.ts` (basta con `pathname.startsWith("/student")`).

```
app/
  (auth)/
    login/
    register/
    forgot-password/
    reset-password/
  student/
    layout.tsx              # <StudentSidebar>
    dashboard/
    protected-areas/
    protected-areas/[id]/
    flash-cards/
  teacher/
    layout.tsx               # <TeacherSidebar>
    dashboard/
    users/
    protected-areas/
    flash-cards/
    ai-providers/
  api/
    auth/
      session/               # route handler propio: set/get/delete de la cookie httpOnly del JWT
  layout.tsx
  providers.tsx            # React Query Provider, ThemeProvider, hidratación de sesión

middleware.ts               # Protección de /student y /teacher por rol, leyendo la cookie del JWT

features/
  <feature>/                # auth, users, protected-areas, flash-cards, ai-providers, ...
    api/                    # funciones que llaman a la API (usan el cliente de lib/api)
    hooks/                  # hooks de React Query (useXQuery, useXMutation)
    components/             # componentes propios de la feature
    schemas/                # esquemas Zod (mismo shape que los DTOs de la API)
    types/                  # tipos TS (mismo shape que los doc/*.doc.ts de la API)

components/
  ui/                       # wrappers/composiciones sobre HeroUI reutilizables entre features
  layout/                   # Navbar, Sidebar, Shell por rol

lib/
  api/
    client.ts               # instancia de axios + interceptor de auth + manejo del envelope
  utils/

hooks/                      # hooks genéricos no atados a una feature
store/                      # stores de Zustand (UI state)
types/                      # tipos compartidos entre features (ej. PaginatedResult<T>)

plan-history/
```

Cada `feature/` es independiente: no importar componentes ni hooks de una feature dentro de otra directamente. Si dos features necesitan compartir algo, ese algo sube a `components/`, `lib/` o `types/`.

---

# Alias

Siempre utilizar los alias configurados en `tsconfig.json`.

```
@/*                  → raíz del proyecto
@/app/*              → app/
@/features/*         → features/
@/components/*       → components/
@/lib/*              → lib/
@/hooks/*            → hooks/
@/store/*            → store/
@/types/*            → types/
```

---

# Roles del sistema

Existen únicamente dos roles, definidos por la API: `STUDENT` y `TEACHER`.

- Los estudiantes solo acceden a las rutas bajo `/student`.
- Los docentes solo acceden a las rutas bajo `/teacher` (panel administrativo).
- Tras login/registro, `getDashboardPath(role)` (`features/auth/utils/`) decide a dónde redirigir: `/student/dashboard` o `/teacher/dashboard`.
- `middleware.ts` decodifica el payload del JWT guardado en la cookie httpOnly (sin verificar firma — solo UX de redirección) y protege `/student/*` y `/teacher/*`: sin sesión → `/login`; sesión con el rol equivocado → su propio dashboard.
- La autorización real siempre la hace `ecoguide-api` verificando la firma completa del JWT en cada request vía el header `Authorization`. El middleware nunca es la única barrera — es una mejora de UX, no el mecanismo de seguridad.
- Nunca confiar en el rol mostrado en el cliente para ocultar una acción sensible sin que la API también la valide — la UI oculta, la API es la que realmente autoriza.

---

# Autenticación

No se usa NextAuth. La sesión se maneja directamente contra el JWT que emite `ecoguide-api`:

- `POST /auth/login` y `POST /auth/register` devuelven el JWT dentro del envelope `{status, message, data}`.
- `ecoguide-api` solo acepta el JWT vía header `Authorization: Bearer` (no cookies) — de ahí el patrón híbrido: `app/api/auth/session/route.ts` guarda el JWT en una cookie httpOnly (nunca en `localStorage`) como fuente de verdad entre recargas para que `middleware.ts` la lea en el servidor, y `store/auth-store.ts` (Zustand, sin `persist`) mantiene el token en memoria para que `lib/api/client.ts` arme el header `Authorization` en cada request del cliente.
- Al cargar la app, `useSessionHydration` (`features/auth/hooks/`) llama al route handler (GET) para leer la cookie httpOnly — el JS del navegador no puede leerla directamente — y luego `GET /auth/me` para rehidratar el usuario en el store.
- El código de recuperación de contraseña (`POST /auth/forgot-password`, `POST /auth/reset-password`) es de 6 dígitos — usar el componente `InputOTP` de HeroUI (construido sobre `input-otp`) para ese formulario.
- El cliente axios (`lib/api/client.ts`) adjunta el JWT automáticamente en cada request y redirige a `/login` si la API responde 401.

---

# Consumo de la API

Toda respuesta de `ecoguide-api` sigue este formato:

```json
{
  "status": "success",
  "message": "Operación realizada correctamente.",
  "data": {}
}
```

Errores:

```json
{
  "status": "error",
  "message": "Descripción del error."
}
```

El cliente axios debe desenvolver `data` automáticamente y propagar `message` como el mensaje de error en caso de `status: "error"` o de un status HTTP de error, para que se pueda mostrar directo en un `Toast` de `@heroui/react`.

Los endpoints de listado devuelven `PaginatedResult<T>` (`items`, `meta: { total, page, limit, totalPages }`) y aceptan `page`, `limit`, `search`, `sort` como query params — sincronizar estos filtros con la URL usando `nuqs`, nunca con estado local aislado (se pierde al refrescar/compartir el link).

---

# Features (mapeo con los módulos de la API)

Ya disponibles en la API, construibles ahora:

```
Auth              → login, registro, recuperación de contraseña, perfil
Users             → panel TEACHER: listar, ver, editar, desactivar usuarios
ProtectedAreas    → STUDENT: listar/ver (solo publicadas) · TEACHER: CRUD completo
FlashCards        → STUDENT: listar/ver por área · TEACHER: CRUD completo
AIProviders       → TEACHER: CRUD de proveedores + catálogo de modelos embebido
```

Pendientes en la API (no construir la vista hasta que exista el endpoint):

```
SpeakingPractices, Chatbot, Tests, StudentProgress, StudentTests,
SpeakingResults, ChatbotConversations, UploadFiles, Dashboard
```

---

# Formularios y validación

- Todo formulario usa `react-hook-form` + `zodResolver`.
- El esquema Zod de cada formulario debe reflejar exactamente las reglas del DTO correspondiente en la API (mismos campos, mismos límites, mismos mensajes de error en español) — evita que el usuario reciba un error 400 que la UI no anticipó.
- Los esquemas viven en `features/<feature>/schemas/`, nunca inline dentro del componente.

---

# Estándares de Código

- TypeScript estricto. Evitar `any`.
- `'use client'` solo en componentes que realmente lo necesiten (estado, efectos, listeners, hooks de React Query/Zustand). Todo lo demás se queda como Server Component.
- PascalCase para componentes y clases.
- camelCase para variables, funciones y hooks (`useProtectedAreas`, no `use_protected_areas`).
- kebab-case para archivos y carpetas.
- UPPER_CASE para constantes.
- Un componente/hook por archivo. Aplicar Early Return.
- Preferir composición sobre herencia; nunca duplicar lógica de fetching entre features (reutilizar `lib/api/client.ts`).
- Server Actions/route handlers propios en `app/api/` solo para lo que estrictamente lo requiera (setear la cookie de auth) — el resto de la comunicación con el backend va vía React Query desde el cliente o Server Components.
- Utiliza fuente siempre de Opens Sans
- Todo debe ser Responsive

---

# Buenas Prácticas

Aplicar siempre:

- SOLID, DRY, KISS
- Separation of Concerns entre `app/` (ruteo), `features/` (lógica + UI de dominio) y `components/` (UI genérica reutilizable)
- Alta cohesión dentro de cada feature, bajo acoplamiento entre features
- Accesibilidad: HeroUI/React Aria ya la resuelven en gran parte — no romperla quitando roles ARIA o el manejo de foco al construir componentes custom encima
- Memoización solo cuando haya un problema de rendimiento medido, no por defecto

Nunca:

- Poner lógica de negocio en componentes de página — vive en `features/<feature>/api` y `hooks`
- Guardar el JWT en `localStorage`/`sessionStorage`
- Confiar únicamente en el rol del cliente para ocultar acciones sensibles
- Duplicar esquemas Zod, hooks de fetching o componentes de UI entre features

---

# Manejo de Errores

- Los errores de la API llegan con `status: "error"` y un `message` en español listo para mostrar — no reformatear ni traducir de nuevo.
- Manejo global de errores de mutaciones/queries vía el `QueryClient` (`onError` por defecto) más overrides puntuales cuando una mutación necesite feedback específico (ej. formulario que resalta el campo en conflicto).
- Mostrar errores con el componente `Toast` de `@heroui/react`; nunca con `alert()`.
- 401 → redirigir a `/login` y limpiar la sesión. 403 → mostrar mensaje de permisos, no redirigir. 404 en un recurso individual → estado vacío en la vista, no un error global.

---

# Variables de Entorno

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000   # Base URL de ecoguide-api
```

Nunca poner secretos reales en variables `NEXT_PUBLIC_*` (son públicas en el bundle del cliente). Este frontend no debe necesitar ningún secreto propio: las API keys de los proveedores de IA, credenciales de correo, etc. viven únicamente en `ecoguide-api`.

---

# Historial de Planes

Por cada plan aprobado y ejecutado se deberá crear un archivo Markdown dentro de:

```
plan-history/
```

Nombre:

```
YYYY-MM-DD-nombre-del-plan.md
```

Debe contener:

- Objetivo
- Cambios realizados
- Razones del cambio
- Resultado final

---

# Errores preexistentes

Cuando durante la ejecución de:

- `npm run build`
- `npm run lint`

se encuentren errores preexistentes que no pertenezcan al trabajo actual, deberán mostrarse al usuario y preguntarle si desea corregirlos o únicamente resolver los errores relacionados con la tarea actual.
