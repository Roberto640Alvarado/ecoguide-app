# AI Providers: toggle en Estado, toolbar de fecha y botón en el encabezado

## Objetivo

Llevar a la tabla de "Proveedores de IA" el mismo patrón ya aplicado en
Estudiantes/Docentes: switch de estado directamente en la columna
"Estado" (en vez de solo una insignia + un botón aparte en Acciones),
filtro de fecha + "Limpiar filtros" en un toolbar pegado a la tabla, y
dejar la columna de Acciones solo con "Editar".

## Cambios realizados

1. `features/ai-providers/types/ai-provider.types.ts`: se agregan
   `createdFrom`/`createdTo` (formato `yyyy-MM-dd`) a
   `FindAIProvidersParams`, igual que ya tenía `FindUsersParams`.
2. `components/ui/data-table.tsx`: el `onRowClick` de esta tabla navega al
   detalle del proveedor al hacer click en cualquier parte de la fila; solo
   la columna `"actions"` detenía la propagación del click. Como ahora la
   columna `"isActive"` también tiene un control interactivo (el switch),
   se generalizó a un nuevo prop `interactiveColumnIds?: string[]`
   (default `["actions"]`, mismo comportamiento de antes si no se pasa) —
   así cualquier columna con un control propio puede optar por no disparar
   la navegación de fila.
3. `app/teacher/ai-providers/page.tsx`:
   - Columna "Estado": la celda pasa de `<ProviderStatusBadge>` (solo
     lectura) a `<ProviderStatusToggle provider={row.original} />` (switch
     con confirmación, mismo componente que ya usa el botón "Activar/
     Desactivar" en el detalle del proveedor). El filtro en el header de
     esta columna no cambia.
   - Columna "Acciones": se quita `<ProviderStatusToggle>` de aquí (ya
     vive en "Estado") — queda solo el botón "Editar".
   - `<DataTable>` recibe `interactiveColumnIds={["actions", "isActive"]}`
     para que el switch de estado no dispare la navegación de fila.
   - Nuevo estado `dateRange` (query param `created`) + `hasActiveFilters`
     + `handleClearFilters`, igual que en `user-list-page.tsx`. Se agrega
     un `toolbar` a `<DataTable>` con `<DateRangeFilter>` ("Fecha de
     creación") y un botón "Limpiar filtros" (`variant="outline"`),
     responsive (columna en mobile, fila en `sm:` y arriba).
   - Nuevo paso de tour `[data-tour="filter-date"]` (mismo patrón que
     Estudiantes/Docentes).
   - El botón "Nuevo proveedor" se mueve al prop `action` de `<PageHeader>`
     (queda arriba de todo, antes del banner del tour) en vez de un bloque
     aparte entre el banner y la tabla.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`).
- `npm run build`: compila y type-checkea sin errores.
- Todos los componentes reusados (`Button`, `ColumnFilter`,
  `DateRangeFilter`, `StatusToggle`) ya están construidos sobre los
  tokens de shadcn/ui (`bg-background`, `border-border`, etc.), por lo que
  se ven bien en claro/oscuro sin CSS adicional — mismo criterio que
  Estudiantes/Docentes.

## Riesgo conocido (sin verificar desde esta sesión)

Igual que con Estudiantes/Docentes: no se puede confirmar desde aquí que
`ecoguide-api` (repo separado) soporte los query params `createdFrom`/
`createdTo` en `GET /ai-providers` — habría que probarlo en vivo.

## Ajuste posterior

El usuario pidió que "Nuevo proveedor" viva dentro del contenedor de la
tabla en vez de arriba de todo (como acción de `<PageHeader>`). Se movió
al mismo `toolbar` del `<DataTable>`, a la derecha del filtro de fecha /
"Limpiar filtros" (`justify-between` en `sm:` y arriba; en mobile los tres
controles se apilan a ancho completo). `<PageHeader>` vuelve a no recibir
`action`.
