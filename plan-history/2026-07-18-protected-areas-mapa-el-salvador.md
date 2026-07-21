# Áreas protegidas: listado en cards, formulario con mapa, y rediseño de ConfirmDialog

## Objetivo

1. Mejorar el diseño de los modales de confirmación de "desactivar usuario" y "desactivar
   proveedor de IA".
2. Construir la vista de Áreas Protegidas del panel de docente como una grilla de cards (en vez
   de tabla, a diferencia de Usuarios/AIProviders).
3. Construir la vista de creación/edición de áreas protegidas.
4. En la creación, mostrar un mapa de El Salvador donde el docente marca la ubicación (clic o
   arrastrando el pin) antes de completar el resto de los campos.

## Cambios realizados

### ConfirmDialog (diseño)

- `components/ui/confirm-dialog.tsx`: `AlertDialogBackdrop variant="blur"`, `AlertDialogContainer
  size="sm"`, ícono personalizable (`icon` prop, antes fijo), y una nota opcional (`note`) para
  transmitir que la acción es reversible.
- `features/users/components/deactivate-user-button.tsx` y
  `features/ai-providers/components/deactivate-provider-button.tsx`: usan el nuevo `icon` y
  `note`, y resaltan en negrita el nombre de la entidad afectada dentro de la descripción.

### Leaflet (mapa de El Salvador)

- Se instalaron `leaflet`, `react-leaflet` y `@types/leaflet`. El `npm install` directo sobre la
  carpeta del proyecto (montada desde OneDrive) falla de forma consistente con errores
  `ENOTEMPTY` al renombrar paquetes de node_modules; se resolvió instalando en una carpeta scratch
  fuera del mount y copiando los paquetes resultantes con `cp -rn` (copia sin sobreescritura, que
  no depende de renombrados atómicos).
- `app/globals.css`: se agregó `@import "leaflet/dist/leaflet.css";`.
- Los íconos por defecto de Leaflet (que normalmente no resuelven bien con bundlers) se copiaron a
  `public/leaflet/` y se referencian por ruta absoluta en vez de depender de un CDN externo.
- `features/protected-areas/components/location-picker-map.tsx`: mapa Leaflet con clic-para-marcar
  y pin arrastrable. Se carga únicamente en cliente vía `next/dynamic(..., { ssr: false })` desde
  `protected-area-form.tsx`, porque Leaflet accede a `window` al montarse.

### Feature `protected-areas`

- `types/protected-area.types.ts`, `schemas/protected-area.schema.ts` (un único esquema
  reutilizado para crear y editar, ya que el mapa garantiza que latitude/longitude siempre tengan
  un valor válido — a diferencia de AIProviders, aquí no existe el caso "campo opcional en
  blanco"), `api/protected-areas.api.ts`, hooks de React Query (`useProtectedAreas`,
  `useProtectedArea`, `useCreateProtectedArea`, `useUpdateProtectedArea`,
  `useUnpublishProtectedArea`).
- `images` se omitió del formulario: la subida de archivos (UploadFiles) todavía no está
  construida en el frontend, siguiendo el mismo criterio ya aplicado en AIProviders.
- Componentes: `ProtectedAreaStatusBadge` (Publicada/Borrador), `ProtectedAreaCard`,
  `ProtectedAreaForm` (mapa + nombre + descripción + toggle de publicación, compartido entre
  crear y editar), `UnpublishAreaButton` (usa `ConfirmDialog`, ya que el DELETE del backend es un
  soft-delete que despublica) y `PublishAreaButton` (acción rápida no destructiva para republicar
  un borrador).

### Vistas

- `/teacher/protected-areas`: grilla de cards (1/2/3 columnas según viewport) con nombre,
  descripción, coordenadas y estado; búsqueda con debounce, filtro por estado, orden y
  paginación — todo sincronizado con la URL vía `nuqs`, igual que Usuarios/AIProviders. Botón
  "Nueva área".
- `/teacher/protected-areas/new` y `/teacher/protected-areas/[id]/edit`: páginas completas (no
  modales, a diferencia de Usuarios/AIProviders) porque el mapa necesita más espacio del que un
  modal ofrece cómodamente. Ambas reutilizan `ProtectedAreaForm`; el mapa se muestra primero,
  seguido de nombre, descripción y el toggle de publicación.
- `components/layout/teacher-sidebar.tsx`: se quitó `comingSoon` de "Áreas protegidas".

## Razones del cambio

- Se priorizó UX de "mapa primero" tal como lo pidió el usuario: el pin ya aparece centrado en El
  Salvador (13.7942, -88.8965) para que el formulario sea válido desde el inicio, y el docente
  simplemente lo reposiciona con un clic o arrastre en vez de tener que escribir coordenadas a
  mano.
- Se usó una grilla de cards en vez de la `DataTable` reutilizada en Usuarios/AIProviders porque
  el usuario pidió explícitamente "iran saliendo en cards con el nombre".
- El endpoint DELETE de ProtectedAreas es un soft-delete (despublica, no borra) porque el modelo
  tiene relaciones en cascada hacia FlashCards, Tests, etc. — por eso la acción rápida en la card
  se llama "Despublicar" (con `ConfirmDialog`, reversible) en vez de "Eliminar".

## Resultado final

- `npx tsc --noEmit` sin errores en `ecoguide-app` tras corregir un caso del bug de desincronización
  de montaje (mismo patrón ya documentado: re-escritura del archivo vía heredoc en bash).
- **Pendiente**: no fue posible ejecutar `npx eslint` en este entorno. El `node_modules` montado
  desde OneDrive no tiene el binario de ESLint completo (falta el paquete `debug` y otros,
  probablemente por los mismos cortes `ENOTEMPTY` de instalaciones previas), y los intentos de
  reinstalarlo — tanto directamente como vía una carpeta scratch — fallaron repetidamente por
  timeouts y errores `ENOTEMPTY` de npm en este sandbox. Se recomienda correr `npm install` seguido
  de `npm run lint` en el entorno local de Windows del usuario (donde no aplican estas
  restricciones del sandbox) antes de dar por cerrada la tarea.
- El docente puede ahora listar/buscar/filtrar/ordenar/paginar áreas protegidas en formato de
  cards, crearlas y editarlas marcando la ubicación en un mapa interactivo de El Salvador, y
  publicar/despublicarlas, todo consumiendo la API real de `ecoguide-api`.
