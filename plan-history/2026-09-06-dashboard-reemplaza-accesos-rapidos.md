# Panel de docente: reemplazo de "Accesos rápidos" por info real

## Objetivo

El usuario mandó captura del panel de docente y pidió mejorar la sección
"Accesos rápidos" (grid de tarjetas de navegación a Estudiantes/Docentes/
Áreas/Proveedores): dijo que esa parte se sentía floja y que en su lugar
debería mostrarse algo con información real que le interese ver al
docente — dejando explícitamente sin tocar el resto del panel (las 4
tarjetas de estadísticas, "Estudiantes recientes" y "Borradores por
publicar"), que calificó de "súper bien".

## Investigación previa

Antes de diseñar el reemplazo se revisó qué datos existen sin trabajo de
backend nuevo (hooks bajo `features/*/hooks`): no hay ningún endpoint de
"stats"/"resumen" agregado a nivel de toda la clase (el progreso de
estudiantes solo se puede pedir por estudiante individual, sería N+1
llamadas para "todos"). Lo que sí es barato y ya está disponible: listas
paginadas de áreas protegidas y proveedores de IA con `meta.total` e
`items`, igual que ya se usaba para "Estudiantes recientes".

## Cambios realizados

`app/teacher/dashboard/page.tsx`:

- Se eliminó la constante `QUICK_ACTIONS` y la sección "Accesos rápidos"
  completa (grid de 5 tarjetas-enlace estáticas).
- En su lugar, una tercera fila de dos tarjetas informativas, con el
  mismo patrón visual ya usado en "Estudiantes recientes"/"Borradores por
  publicar" (lista con ícono, título, subtítulo, `Ver todos`):
  - **"Publicadas recientemente"**: las últimas áreas protegidas
    publicadas (`useProtectedAreas({ isPublished: true, limit: 5,
    sort: "createdAt:desc" })` — se aprovechó la misma llamada que ya
    alimentaba el stat "Áreas publicadas", subiendo el `limit` de 1 a 5
    y reutilizando `items` para la lista, sin llamada extra). Complementa
    a "Borradores por publicar" mostrando el lado opuesto: qué está
    visible para los estudiantes ahora mismo.
  - **"Proveedores de IA"**: los proveedores más recientes (activos e
    inactivos, para poder notar si algo quedó mal configurado), con su
    tipo (`AI_PROVIDER_TYPE_LABELS`) y el badge de estado ya existente
    (`ProviderStatusBadge`), enlazando al detalle de cada proveedor. Esta
    sí es una llamada nueva (`useAIProviders({ limit: 5, sort:
    "createdAt:desc" })`) separada del stat "Proveedores de IA activos"
    (que sigue filtrando solo `isActive: true`).
- Se quitaron los imports que solo usaba la sección eliminada
  (`PlusCircle`, `UserCog`) y se agregaron los que necesita la nueva
  (`Sparkles`, `ProviderStatusBadge`, `AI_PROVIDER_TYPE_LABELS`).

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`, sin cambios).
- `npm run build`: compila, type-checkea y genera todas las páginas sin
  errores.
