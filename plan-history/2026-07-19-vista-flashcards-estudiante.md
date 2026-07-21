# Vista de FlashCards del estudiante (mazo por área protegida)

## Objetivo

Mostrar las flashcards de un área protegida al estudiante con un diseño
cuidado, accesibles únicamente desde el recorrido guiado de esa área
(nunca desde un ítem de menú global), tal como pidió el usuario: el
estudiante entra por la reserva, no por un listado de flashcards suelto.

## Cambios realizados

- `components/layout/student-sidebar.tsx`: se eliminó el ítem de menú
  "FlashCards" (`/student/flash-cards`, marcado `comingSoon`). El sidebar
  del estudiante ahora solo tiene Dashboard y Áreas protegidas.
- `features/flash-cards/types/flash-card.types.ts`: se agregó
  `FLASH_CARD_TYPE_TONE`, única fuente de verdad para los colores por
  categoría (badge, degradado de tarjeta, color de ícono), evitando
  duplicar clases de Tailwind entre el badge del maestro y el mazo del
  estudiante.
- `features/flash-cards/components/flash-card-type-badge.tsx`: refactor
  para consumir `FLASH_CARD_TYPE_TONE` en vez de su propio mapa de colores
  privado.
- `features/flash-cards/components/flash-card-quiz.tsx` (nuevo):
  interacción de opción múltiple para tarjetas `ENVIRONMENTAL` — el
  estudiante elige una opción, se resalta en verde/rojo según sea
  correcta, y se muestra un mensaje de retroalimentación.
- `features/flash-cards/components/flash-card-student-card.tsx` (nuevo):
  una tarjeta individual del mazo — mascota EcoGuide, badge de categoría,
  título, y contenido de lectura o el quiz según el tipo, con degradado de
  fondo propio de la categoría.
- `features/flash-cards/components/flash-card-deck.tsx` (nuevo): el mazo
  completo — carrusel Embla (swipe nativo, mismo patrón que
  `ProtectedAreaImageCarousel`), chips para saltar directo a una
  categoría, barra de progreso, controles de anterior/siguiente, estado
  vacío y una tarjeta de cierre al llegar a la última flashcard con enlace
  de vuelta al recorrido.
- `app/student/protected-areas/[id]/flash-cards/page.tsx` (nuevo): carga
  el área y todas sus flashcards (`limit: 100`, `sort: order:asc` — el
  límite máximo que permite `PaginationQueryDto` en la API, suficiente
  para traer el mazo completo en una sola petición) y renderiza
  `FlashCardDeck`.
- `app/student/protected-areas/[id]/tour/page.tsx`: el paso "FlashCards"
  del timeline ahora enlaza a la nueva vista (insignia "Comenzar" en vez
  de "Coming soon", tarjeta resaltada en acento). Los demás pasos
  (Speaking, Chatbot, Test, Grade) siguen deshabilitados porque esos
  módulos aún no existen en la API.

## Razones del cambio

- El usuario fue explícito: el acceso a flashcards debe darse al entrar a
  una reserva específica, no desde un menú global — de ahí que se quitara
  el ítem del sidebar y se conectara el punto de entrada real (el paso
  "FlashCards" del recorrido guiado).
- Se reutilizó Embla Carousel (ya listado como dependencia del proyecto
  específicamente para "carrusel de flashcards") en vez de introducir una
  librería nueva.
- Se centralizó la paleta por categoría en un único mapa (`FLASH_CARD_TYPE_TONE`)
  para no duplicar lógica de color entre el panel del maestro y la vista
  del estudiante, siguiendo DRY.
- Los colores usados (`accent`, `success`, `danger`, `default`, cada uno
  con su variante `-soft`/`-soft-foreground`, más `surface`) son
  exclusivamente tokens ya confirmados en uso en el resto de la web — no
  se inventaron clases nuevas de Tailwind.

## Resultado final

El estudiante que entra a un área protegida y pulsa "Empezar recorrido"
ve el paso de FlashCards habilitado; al entrar, recorre un mazo de
tarjetas con swipe, cada una temática según su categoría, con quiz
interactivo para las de tipo ambiental, chips para saltar de categoría y
una tarjeta de cierre que lo regresa al recorrido. No fue posible correr
`tsc --noEmit` hasta el final en este entorno (timeout ya documentado en
sesiones anteriores); se hizo revisión manual de imports/tipos en los 8
archivos tocados. Se recomienda correr `npm run build` y `npm run lint`
localmente antes de dar por cerrada la tarea.
