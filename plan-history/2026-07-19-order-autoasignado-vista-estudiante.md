# FlashCards: order automático + vista de estudiante para áreas protegidas

## Objetivo

Corregir el flujo de creación de flashcards (quitar el campo "orden" que el
maestro no debía capturar) y construir la primera vista de estudiante: un
mapa de El Salvador para explorar áreas protegidas y entrar al detalle de
una.

## Cambios realizados

### Backend (`ecoguide-api`)

- `order` ahora es opcional en `CreateFlashCardDto`. Si no se envía,
  `FlashCardsService` lo calcula automáticamente:
  `order = FLASH_CARD_TYPE_RANK[type] * 1000 + <flashcards existentes de ese
  tipo en el área> + 1`, con `FLASH_CARD_TYPE_RANK` fijando la secuencia
  WELCOME(0) → GASTRONOMY(1) → FLORA_FAUNA(2) → ENVIRONMENTAL(3) →
  CURIOUS_FACT(4) → VOCABULARY(5). Ordenar por `order` ascendente agrupa
  automáticamente las flashcards en esa secuencia y, dentro de cada
  categoría, por orden de creación.
- Se agregó `FlashCardsRepository.countByAreaAndType()` para soportar el
  cálculo anterior.
- `FlashCardsService.update()` recalcula `order` si el `type` cambia (y no
  se envía un `order` explícito), para que la flashcard "salte" al bloque
  de su nueva categoría.
- Tests nuevos en `flash-cards.service.spec.ts` cubriendo la
  auto-asignación en create/update y el caso donde se respeta un `order`
  explícito.

### Frontend (`ecoguide-app`)

- Se quitó el campo "Orden" de `FlashCardForm`, del schema de Zod y de la
  columna "Orden" en la tabla de listado (el valor ahora es un detalle
  interno de ordenamiento, no algo legible/editable por el maestro).
- Nueva vista de estudiante en `/student/protected-areas`: mapa de Leaflet
  (`ProtectedAreasMap`, nuevo componente de solo lectura con un marcador
  por área, clonado del patrón de `LocationPickerMap` ya usado en el panel
  de maestro) más una grilla de tarjetas debajo, con buscador. El backend
  ya filtra automáticamente `isPublished=true` para el rol STUDENT
  (`ProtectedAreasService.findAll`), así que se reutilizaron los hooks
  existentes de `features/protected-areas` sin cambios.
- Nueva vista de detalle en `/student/protected-areas/[id]`: portada,
  descripción, galería de imágenes restantes, ubicación, y una sección
  "el recorrido guiado llega pronto" como marcador de posición para
  FlashCards/Speaking/Chatbot del lado estudiante (fuera de alcance de
  esta tarea).
- Se activó el ítem "Protected Areas" en `StudentSidebar` (se quitó
  `comingSoon`). El ítem "FlashCards" del estudiante se deja tal cual
  (`comingSoon: true`) porque la vista de estudiante para repasar
  flashcards no fue parte de esta tarea.

## Razones del cambio

- El usuario indicó explícitamente que el orden de las categorías es fijo
  y no debe pedirse al maestro; delegar el cálculo al backend evita
  duplicar esa regla de negocio en el frontend y la mantiene consistente
  sin importar qué cliente cree la flashcard.
- La vista de estudiante reutiliza el mismo endpoint `GET /protected-areas`
  que ya filtra por rol en el backend, evitando construir un endpoint
  paralelo "público" — el filtro de seguridad vive en un solo lugar.

## Resultado final

Crear una flashcard ya no requiere capturar un orden manual; el orden
queda determinado por la categoría elegida. Los estudiantes pueden entrar a
`/student/protected-areas`, explorar el mapa o la lista, y abrir el detalle
de un área.

## Pendiente / bloqueado

- **Imágenes de avatar por categoría**: el usuario adjuntó dos imágenes con
  6 gestos del mascota EcoGuide (uno por categoría de flashcard) para
  guardarlas en `public/avatars`, pero los archivos no llegaron al entorno
  de este agente (la carpeta de adjuntos permaneció vacía pese a haberse
  reenviado). No se creó la carpeta ni se guardaron imágenes. Pendiente que
  el usuario las coloque directamente en la carpeta del proyecto (arrastrar
  a `ecoguide-app/public/`) para poder recortarlas y nombrarlas por
  categoría.
- **Verificación `tsc`/`eslint`**: igual que en la tarea anterior, no fue
  posible completarla en este entorno por límites de tiempo — revisar
  manualmente localmente antes de dar por cerrado.
