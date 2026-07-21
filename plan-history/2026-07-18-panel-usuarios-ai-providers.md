# Panel de docente: gestión de Usuarios y Proveedores de IA

## Objetivo

Construir las vistas del panel de docente para administrar cuentas de usuario (estudiantes y
docentes) y proveedores de IA (incluyendo su catálogo de modelos), consumiendo los endpoints ya
existentes en `ecoguide-api` (`/users` y `/ai-providers`), tal como lo define `CLAUDE.md` de
`ecoguide-app` en la sección "Features".

## Cambios realizados

### Infraestructura compartida

- `app/providers.tsx`: se agregó `NuqsAdapter` (sincronizar filtros de listado con la URL) y
  `ToastProvider` de HeroUI (feedback de mutaciones vía `toast.success`/`toast.danger`, en vez de
  `alert()`, según CLAUDE.md).
- `components/ui/data-table.tsx`: tabla genérica con TanStack Table (headless) + Tailwind,
  reutilizable por cualquier listado futuro del panel.
- `components/ui/sortable-header.tsx`: encabezado de columna clicable con indicador de orden
  asc/desc, desacoplado de `DataTable` para no requerir aumentar los tipos de `ColumnMeta`.
- `components/ui/pagination-controls.tsx`: controles de paginación (anterior/siguiente + resumen)
  a partir de `PaginationMeta`.
- `components/ui/confirm-dialog.tsx`: diálogo de confirmación reutilizable (`AlertDialog` de
  HeroUI) para acciones destructivas (desactivar usuario/proveedor, eliminar modelo).
- `components/ui/form-modal.tsx`: modal reutilizable (`Modal` de HeroUI) que expone `close()` a
  sus hijos vía render-prop, para cerrar el modal tras una mutación exitosa.
- `components/ui/toggle-field.tsx`: interruptor accesible para campos `isActive`, reutilizado en
  ambas features.
- `components/ui/secret-field.tsx`: input tipo password con mostrar/ocultar, para el API key de
  los proveedores de IA (nunca se muestra en claro, igual que el backend nunca la devuelve).

### Feature `users` (`/teacher/users`)

- `features/users/types`, `schemas/update-user.schema.ts` (espeja `UpdateUserDto`, mismos
  mensajes en español), `api/users.api.ts`, hooks de React Query (`useUsers`, `useUpdateUser`,
  `useDeactivateUser`).
- Componentes: `UserRoleBadge`, `UserStatusBadge`, `EditUserModal` (nombre, apellido, correo, rol,
  cuenta activa), `DeactivateUserButton` (soft-delete, oculto si ya está inactivo).
- Vista: tabla con avatar+nombre+correo, rol, estado, fecha de registro; búsqueda con debounce,
  filtro por rol, orden por nombre/fecha y paginación — todo sincronizado con la URL vía `nuqs`.

### Feature `ai-providers` (`/teacher/ai-providers` y `/teacher/ai-providers/[id]`)

- `features/ai-providers/types`, `schemas` (`create-ai-provider`, `update-ai-provider`, `model`,
  espejando `CreateAIProviderDto`/`UpdateAIProviderDto`/`CreateModelDto`/`UpdateModelDto`),
  `api/ai-providers.api.ts` (proveedor + sub-recurso de modelos), hooks de React Query para cada
  operación (crear/editar/desactivar proveedor; agregar/editar/eliminar modelo).
- Componentes: `ProviderStatusBadge`, `CreateProviderModal`, `EditProviderModal` (apiKey opcional:
  en blanco conserva la clave actual, ya que nunca se expone), `DeactivateProviderButton`,
  `ModelFormModal` (un solo componente para agregar y editar modelo) y `RemoveModelButton`.
- Vista de listado: tabla con proveedor (enlaza al detalle), cantidad de modelos, estado, fecha de
  creación; búsqueda, filtro por estado, orden y paginación; botón "Nuevo proveedor".
- Vista de detalle (`[id]`): datos del proveedor con acciones de editar/desactivar, y el catálogo
  de modelos completo con alta/edición/baja individual.

### Navegación

- `components/layout/teacher-sidebar.tsx`: se quitó `comingSoon` de "Estudiantes" y "Proveedores
  de IA", ahora enlazan a las vistas reales.

## Razones del cambio

- Se siguió el mapeo de features ya definido en `CLAUDE.md` ("Ya disponibles en la API,
  construibles ahora": Users y AIProviders), reutilizando exactamente los DTOs/respuestas del
  backend para que los esquemas Zod y tipos TS no diverjan del contrato real.
- El catálogo de modelos se maneja en una vista de detalle separada (no modales anidados dentro de
  modales) porque el backend ya lo trata como sub-recurso independiente
  (`/ai-providers/:id/models`), lo cual se traduce en una UI más clara.
- Se prefirió `<select>` nativo (reutilizando la clase `.input` de HeroUI) en vez del componente
  `Select` de HeroUI para los filtros, priorizando una superficie de riesgo menor sin sacrificar
  consistencia visual.

## Resultado final

- `npx tsc --noEmit` y `npx eslint app components store lib features middleware.ts` sin errores
  ni warnings en `ecoguide-app`; `npx tsc --noEmit` sin errores en `ecoguide-api` (sin cambios de
  backend en esta tarea).
- El docente puede ahora listar/buscar/filtrar/ordenar/paginar usuarios, editarlos y desactivarlos,
  y administrar proveedores de IA junto con su catálogo de modelos, todo consumiendo la API real.
