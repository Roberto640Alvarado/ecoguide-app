# Rediseño del mazo de flashcards del estudiante

## Objetivo

Dar un mejor diseño a todos los tipos de flashcard, hacerlo responsive, con
animaciones, y que pasar de una tarjeta a otra sea intuitivo y se vea bien.

## Cambios realizados

- `flash-card-trail-progress.tsx` (reemplaza `flash-card-stepper.tsx`): el
  progreso es un sendero con un punto por tarjeta; el camino se pinta en
  verde al avanzar y la mascota de la categoría actual se desplaza por él
  (`layoutId`). Cada punto salta a su tarjeta; los cambios de categoría se
  marcan con puntos más grandes. Cabe sin scroll horizontal en móvil.
- `flash-card-deck.tsx`: se reemplazó Embla por Framer Motion. Pila de
  tarjetas (las siguientes asoman debajo con el tono de su categoría);
  al avanzar la tarjeta sale hacia la izquierda y la siguiente sube de la
  pila; al retroceder la anterior regresa desde la izquierda. Navegación
  con arrastre/swipe, flechas ← → del teclado y botones; en móvil la barra
  Anterior/Siguiente queda fija abajo y "Siguiente" muestra la categoría
  que viene. Al cambiar de tarjeta se regresa al inicio del mazo si el
  estudiante había bajado. Las respuestas del quiz se guardan en el mazo.
- `flash-card-deck-card.tsx`: tarjeta arrastrable que se inclina según el
  arrastre (`touch-action: pan-y` para no bloquear el scroll vertical).
- `flash-card-media-panel.tsx`: la imagen del docente ocupa todo el panel
  con la mascota como sello; sin imagen, la mascota grande sobre el tono
  de la categoría con anillos tipo curvas de nivel.
- `flash-card-student-card.tsx`: estructura común (panel visual + contenido
  con entrada escalonada) y cuerpo por tipo: bienvenida con texto más
  grande, dato curioso en recuadro "¿Sabías que…?", quiz, vocabulario.
- `flash-card-quiz.tsx`: opciones con letra, sacudida al fallar, ícono que
  aparece al responder y mensaje de resultado; ahora es controlado.
- `flash-card-vocabulary-list.tsx`: sin numeración (no es una secuencia);
  el audio se corta al desmontarse la tarjeta.

## Razones del cambio

- El stepper anterior y las flechas superpuestas en móvil no dejaban claro
  cómo avanzar; el swipe de Embla no era visible.
- Todos los tipos se veían igual; la imagen quedaba al final del texto.
- Todas las animaciones respetan `prefers-reduced-motion` (sin arrastre ni
  desplazamientos, solo fundido).

## Resultado final

Probado con datos de ejemplo en escritorio (1280px) y móvil (390px, sin
scroll horizontal): sendero, transición de avance/retroceso, arrastre,
teclado, quiz y vocabulario funcionan.
