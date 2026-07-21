# Fix: no se podía crear ninguna flashcard

## Objetivo

Encontrar y corregir la causa real por la que el formulario de FlashCards
nunca lograba crear (ni editar) una tarjeta, sin importar la categoría
elegida.

## Causa raíz

En `features/flash-cards/schemas/flash-card.schema.ts`, el campo `options`
se definía como:

```ts
options: z.array(z.string().min(1, "La opción no puede estar vacía.")).optional()
```

`FlashCardForm` inicializa `options` con `["", ""]` **siempre**, sin
importar la categoría elegida (la sección de opciones solo se oculta
visualmente para tipos distintos de ENVIRONMENTAL, pero el campo sigue
existiendo en el estado del formulario). Como el array nunca estaba
`undefined` — siempre tenía dos strings vacíos — Zod validaba cada elemento
con `.min(1)` y fallaba siempre, para cualquier categoría, incluso
GASTRONOMY/WELCOME/etc. donde `options` ni siquiera se muestra ni se envía
al backend.

El `.optional()` a nivel de array no protegía de esto: solo permite que el
campo esté ausente, no que esté presente con elementos inválidos.

Esto explica el reporte del usuario ("no se crea la flashcard") para
cualquier categoría, desde el principio — no era un problema de
`WELCOME`/Prisma ni del backend.

## Cambios realizados

- `flash-card.schema.ts`: se quitó el `.min(1)` por elemento de `options`.
  El requisito real (al menos 2 opciones no vacías, solo para
  ENVIRONMENTAL) se mueve por completo al `superRefine`, que ahora filtra
  las opciones en blanco antes de contarlas y de validar `correctAnswer`.
- `flash-cards.api.ts` (`normalizePayload`): al enviar una flashcard
  ENVIRONMENTAL, ahora también filtra las filas de opción vacías antes de
  mandarlas a la API (el editor de opciones permite dejarlas en blanco
  mientras el maestro escribe).
- `FlashCardForm`: se agregó un toast de error cuando la validación del
  cliente falla (`handleSubmit(onSubmit, onInvalid)`), mostrando el primer
  mensaje de error o uno genérico si no hay uno específico. Esto hace
  visible cualquier bloqueo de validación futuro en vez de que el botón
  "Crear"/"Guardar" parezca no responder.

## Resultado final

Crear y editar flashcards de cualquier categoría ya no queda bloqueado por
esta validación fantasma. Además, cualquier error de validación (presente o
futuro) ahora se anuncia con un toast en vez de quedar como texto pequeño
fácil de pasar por alto.
