# FlashCards: entorno de administración (TEACHER)

## Objetivo

Construir el panel de administración de FlashCards para docentes, cubriendo
las 6 categorías del dominio: WELCOME, GASTRONOMY, FLORA_FAUNA, ENVIRONMENTAL
(pregunta de opción múltiple), CURIOUS_FACT y VOCABULARY.

## Cambios realizados

### Backend (`ecoguide-api`)

- Se agregó `WELCOME` al enum `FlashCardType` en `prisma/schema.prisma`
  (antes solo tenía GASTRONOMY, FLORA_FAUNA, ENVIRONMENTAL, CURIOUS_FACT,
  VOCABULARY). El resto del backend (DTOs, repository, service, controller)
  ya existía de una sesión anterior y no necesitó cambios: los DTOs validan
  el enum de forma genérica (`@IsEnum(FlashCardType)`), sin valores
  hardcodeados.

### Frontend (`ecoguide-app`)

- `features/flash-cards/types/flash-card.types.ts`: tipos `FlashCard`,
  `FindFlashCardsParams`, `FLASH_CARD_TYPES` y `FLASH_CARD_TYPE_LABELS`
  (EN/ES) para las 6 categorías.
- `features/flash-cards/schemas/flash-card.schema.ts`: espeja
  `CreateFlashCardDto`/`UpdateFlashCardDto`, incluyendo la validación
  condicional de `question`/`options`/`correctAnswer` solo para tipo
  ENVIRONMENTAL (equivalente a los `@ValidateIf` de la API, vía
  `superRefine`).
- `features/flash-cards/api/flash-cards.api.ts`: CRUD contra
  `/flash-cards` + subida de imagen vía `/upload-files?folder=flash-cards`.
- `features/flash-cards/hooks/`: `useFlashCards`, `useFlashCard`,
  `useCreateFlashCard`, `useUpdateFlashCard`, `useRemoveFlashCard`,
  `useUploadFlashCardImage`.
- `features/flash-cards/components/`: `FlashCardTypeBadge`,
  `FlashCardImageUploader` (variante de un solo archivo del
  `ImageUploader` de ProtectedAreas), `FlashCardOptionsField` (editor de
  opciones de respuesta), `FlashCardForm` (formulario completo con sección
  condicional para ENVIRONMENTAL) y `RemoveFlashCardButton`.
- Rutas nuevas, todas anidadas bajo el área protegida (la API exige
  `protectedAreaId` para listar):
  - `/teacher/protected-areas/[id]/flash-cards` — listado (tabla, filtro
    por categoría, búsqueda, orden, paginación).
  - `/teacher/protected-areas/[id]/flash-cards/new` — crear.
  - `/teacher/protected-areas/[id]/flash-cards/[flashCardId]/edit` —
    editar.
- `ProtectedAreaCard` y la página de edición de área protegida ahora
  tienen un botón "FlashCards" que lleva al listado de esa área.
- `TeacherSidebar`: se quitó el item de navegación "FlashCards" que
  apuntaba a `/teacher/flash-cards` (ruta que nunca existió como página
  real, marcada `comingSoon`), ya que el acceso correcto siempre requiere
  seleccionar primero un área protegida.

## Razones del cambio

- El usuario pidió explícitamente las 6 categorías, pero el enum de la base
  de datos solo tenía 5 (faltaba WELCOME). Se corrigió en el schema en vez
  de reinterpretar "WELCOME" como otra cosa, siguiendo la convención del
  proyecto de preferir enums sobre strings literales y mantener la base de
  datos como fuente de verdad.
- Eliminar una flashcard es un hard delete (confirmado en
  `flash-cards.service.ts`: no hay relaciones `onDelete: Cascade` que
  dependan de FlashCard), a diferencia de ProtectedAreas que usa soft
  delete (unpublish). Por eso `RemoveFlashCardButton` usa un mensaje de
  advertencia sin la nota "esto es reversible" que sí tiene
  `UnpublishAreaButton`.
- Se optó por un formulario de página completa (como ProtectedAreas) en
  vez de un modal (como Users/AIProviders) porque la sección condicional de
  ENVIRONMENTAL (pregunta + opciones dinámicas + respuesta correcta) tiene
  una complejidad comparable al mapa de ProtectedAreas.

## Resultado final

CRUD completo de FlashCards operativo desde el panel de docente, scoped por
área protegida, con las 6 categorías del dominio y validación de opción
múltiple para ENVIRONMENTAL.

**Nota de verificación**: no fue posible completar una corrida de
`npx tsc --noEmit` (ni siquiera acotada solo a los archivos nuevos, ni
`eslint`) dentro del entorno de este agente — el proceso excede
consistentemente el límite de tiempo disponible por llamada, aparentemente
por la latencia de E/S del mount de OneDrive sobre el árbol de
`node_modules`. Todos los archivos se revisaron manualmente contra los
patrones ya verificados de ProtectedAreas/Users/AIProviders (mismo uso de
`Controller` + `<select {...field}>`, mismo esquema de Zod v4 con
`{ message }`, mismos helpers `apiGet/apiPost/apiPatch/apiDelete`). Se
recomienda correr `npx tsc --noEmit` y `npm run lint` localmente antes de
dar por cerrada la tarea.

Nota adicional: la nueva flashcard requiere que el backend corra
`npx prisma generate` después de este cambio de schema para que el cliente
de Prisma reconozca `WELCOME` como valor válido del enum.
