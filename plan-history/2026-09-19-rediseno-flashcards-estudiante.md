# Rediseño de la vista de FlashCards del estudiante: animaciones y responsive

## Objetivo

Arrancar la migración de las vistas de estudiante (las de docente ya
tenían su rediseño) empezando por `/student/protected-areas/[id]/flash-cards`.
El usuario pidió mejor diseño en cómo se visualizan las flashcards, que
fueran responsive, y mejores animaciones con Framer Motion, manteniendo
soporte de tema claro/oscuro.

## Cambios realizados

`components/ui/alert-dialog.tsx` (nuevo): primer componente `AlertDialog`
de shadcn/ui del proyecto, sobre el primitivo `AlertDialog` de `radix-ui`
(ya instalado), siguiendo el mismo patrón `data-slot`/`cn` que
`sheet.tsx`/`popover.tsx`. Las acciones reutilizan `buttonVariants` del
`Button` de shadcn.

`features/flash-cards/components/flash-card-finish-dialog.tsx`: migrado de
`AlertDialogRoot` (HeroUI) al nuevo `AlertDialog` de shadcn/ui — mismo
patrón ya usado en `2026-09-06-rediseno-detalle-proveedor.md` para otras
vistas. El estado abierto/cerrado ahora es explícito (`useState`) para
poder disparar el confeti en el mismo click que abre el diálogo. Se agregó
una animación de "pop" (spring, rotate+scale) al ícono de celebración con
Framer Motion, y el botón "Terminado" tiene feedback de hover/tap.

`features/flash-cards/components/flash-card-student-card.tsx`: rediseño
visual — sombra en la tarjeta, halo desenfocado del tono de la categoría
(`theme.blob`, mismo tono que el badge, ver types) detrás de la mascota, y
animaciones de entrada por tarjeta controladas por una nueva prop
`isActive`. Como Embla monta todas las tarjetas del mazo a la vez, antes
las animaciones de Framer Motion solo se veían una vez al cargar la
página; ahora el avatar y la burbuja "hacen pop" cada vez que el
estudiante navega hacia esa tarjeta (`animate` reacciona al cambio de
`isActive`, con un pequeño delay en la burbuja para que el avatar entre
primero).

`features/flash-cards/components/flash-card-deck.tsx`:
- Pasa `isActive={index === selectedIndex}` a cada `FlashCardStudentCard`.
- Los chips de categoría ahora usan un `motion.span` con `layoutId`
  compartido para el fondo de la píldora activa — al cambiar de tarjeta,
  el indicador se desliza animado hacia el nuevo chip en vez de solo
  cambiar de color de golpe.
- Fila de chips: scroll horizontal en mobile (`overflow-x-auto`) y wrap en
  `sm:` hacia arriba, para que la etiqueta larga de "Ambiental (opción
  múltiple)" no rompa el layout en pantallas angostas.
- Flechas de navegación del carrusel y los botones "Anterior"/"Siguiente"
  ahora son `motion.button` con `whileHover`/`whileTap` en vez de solo
  transiciones CSS.
- Estado vacío ("sin flashcards") con una pequeña animación de entrada.

`features/flash-cards/components/flash-card-quiz.tsx`: los botones de
opción ahora tienen feedback de hover/tap (solo mientras no se ha
respondido) y los íconos de correcto/incorrecto entran con
`AnimatePresence` (scale+fade) en vez de aparecer de golpe.

`features/flash-cards/components/flash-card-type-badge.tsx`: pequeña
animación de entrada (fade+scale) al montar — componente compartido con la
tabla de flashcards del docente, cambio puramente aditivo y de bajo
riesgo.

`features/flash-cards/types/flash-card.types.ts`: `FLASH_CARD_TYPE_TONE`
gana tres campos aditivos por categoría (`chipBg`, `chipText`, `blob`) que
repiten por separado las clases que ya componía `badge` — los usan el
indicador animado de chips y el halo detrás de la mascota, sin duplicar la
fuente de verdad de color por categoría.

`app/student/protected-areas/[id]/flash-cards/page.tsx`: se reemplazó el
`Spinner` de `@heroui/react` por `Loader2` de `lucide-react`, mismo patrón
ya usado en las vistas de docente migradas (ver
`2026-09-06-rediseno-detalle-proveedor.md`).

## Pendiente / no tocado en esta ronda

El resto de las vistas de estudiante (`dashboard`, `protected-areas`,
`tour`, `chatbot`, `speaking-practice`, `test`, `progress`) no se tocó —
quedan para rondas siguientes de la migración vista por vista. Tampoco se
tocó `StepProgress` (`components/ui/step-progress.tsx`): es un componente
compartido con `TestTaker`, y no apareció en lo pedido.

## Verificación

- `npm run lint`: 0 errores (solo las mismas 5 advertencias preexistentes
  de `react-hooks/incompatible-library`, sin relación con este cambio).
- `npx tsc --noEmit`: sin errores de tipos en todo el proyecto.
- `npm run build`: no se pudo completar en este entorno — Turbopack falla
  al intentar descargar la fuente Open Sans desde Google Fonts
  (`next/font`) porque el shell de este entorno no tiene salida de red
  hacia `fonts.googleapis.com`. Es una limitación de red del entorno, no
  un error introducido por este cambio (ocurre incluso sin tocar código,
  apenas al limpiar `.next` y volver a compilar). Se recomienda correr
  `npm run build` en un entorno con acceso a internet antes de desplegar.

## Ajuste posterior: página "a medias" al cargar (no era un bug de diseño)

El usuario reportó que la vista se veía "movida"/desbordada: el link
"Volver al recorrido" y el encabezado (ícono + título + nombre del área)
no se veían, tapados detrás de la barra superior `sticky` del layout
(`components/layout/dashboard-shell.tsx`). No era un problema de diseño ni
de overflow — la página quedaba scrolleada verticalmente al cargar.

Causa raíz: `app/globals.css` define `html { scroll-behavior: smooth; }`
(preexistente). Next.js hace scroll-to-top al navegar entre rutas del App
Router, y con `scroll-behavior: smooth` activo esa corrección se vuelve una
animación, que puede quedar interrumpida/a medias si algo más dispara otro
scroll casi al mismo tiempo — exactamente lo que Next.js advierte en
consola ("Detected `scroll-behavior: smooth` on the `<html>` element...").
En este caso, el candidato más probable era el propio `StepProgress`
(usado por `FlashCardDeck`), que llama `scrollIntoView()` en un
`useEffect` que corre también en el primer render.

Cambios:

- `app/layout.tsx`: se agregó `data-scroll-behavior="smooth"` al `<html>`
  — el fix que el propio warning de Next.js recomienda, para que el
  scroll-to-top del router coordine correctamente con el
  `scroll-behavior: smooth` de CSS en vez de competir con él.
- `components/ui/step-progress.tsx`: el `useEffect` que hace
  `scrollIntoView()` ahora se salta el primer render (`isFirstRenderRef`)
  — solo importa llevar el paso activo a la vista cuando el estudiante
  navega entre pasos después de que la página ya cargó, no en el mount
  inicial. Componente compartido con `TestTaker`; el cambio es aditivo
  (mismo comportamiento en cualquier cambio de paso posterior al montaje).

### Verificación

- `npm run lint`: 0 errores (mismas 5 advertencias preexistentes).
- `npx tsc --noEmit`: sin errores de tipos.
- No se pudo re-verificar visualmente en este entorno (sin credenciales
  para iniciar sesión en la app desde aquí) — pendiente que el usuario
  confirme en su navegador tras un refresh.

## Segundo ajuste: rediseño de la tarjeta (bug real de desborde horizontal)

El usuario reportó, con captura, texto cortado a la mitad de una palabra
("...ferns, or" saltando directo a "bromeliads", sin "orchids,") — un
desborde horizontal real, no un problema de percepción. Causa: el mazo
completo (`FlashCardDeck`) nunca tuvo un ancho máximo, así que en un
monitor ancho la fila `avatar + burbuja` (`flex sm:flex-row`) podía
estirarse sin límite.

Cambios:

- `features/flash-cards/components/flash-card-deck.tsx`: el contenedor
  raíz del mazo (chips, stepper, carrusel y botones) ahora es
  `mx-auto w-full max-w-2xl` — en pantallas angostas sigue ocupando el 100%
  (responsive normal), pero nunca se estira más allá de un ancho de
  lectura cómodo. Los botones "Anterior"/"Siguiente"/"Terminado" pasan de
  `flex justify-between` a `grid grid-cols-2` (dos columnas parejas, en vez
  de que "Anterior" desaparezca con `opacity-0` dejando "Siguiente"
  descentrado).
- `features/flash-cards/components/flash-card-student-card.tsx`: rediseño
  de layout — la mascota ya NO va al lado del texto en una fila
  (`sm:flex-row`, la fuente del desborde), ahora va CENTRADA ARRIBA del
  título, con el contenido en una tarjeta debajo a todo el ancho
  disponible (ya acotado por el `max-w-2xl` del mazo). Se quitó la "colita"
  de burbuja apuntando al avatar (dependía de esa posición lateral) a favor
  de una tarjeta simple. `break-words` + `overflow-x-hidden` como resguardo
  adicional contra contenido sin espacios (URLs largas, etc.).
- `features/flash-cards/components/flash-card-finish-dialog.tsx`: el botón
  "Terminado" ahora es `w-full` para verse consistente con "Anterior" en el
  nuevo grid de dos columnas.

### Verificación

- `npm run lint`: 0 errores (mismas 5 advertencias preexistentes).
- `npx tsc --noEmit`: sin errores de tipos.
- Sigue pendiente confirmación visual del usuario (sin credenciales para
  probar la app autenticada desde este entorno).

## Tercer ajuste: presentación de la tarjeta y stepper (con referencia visual)

El usuario mandó dos capturas de referencia (un stepper tipo "wizard" con
pasos en tarjetas redondeadas y número superpuesto al borde) y pidió mejor
diseño de cómo se presenta la flashcard y del stepper. Además, en su
captura anterior las flechas de navegación flotantes se veían "sueltas" a
mitad de un espacio en blanco sin relación clara con la tarjeta.

Causa de las flechas "sueltas": `cardGradient` iba de `from-<tono>-soft` a
`to-surface` cubriendo TODA la tarjeta (`bg-gradient-to-b` en el
contenedor completo) — en tarjetas con poco texto, la mitad inferior de
ese degradado ya era casi blanco puro, indistinguible del fondo blanco de
la página, así que el borde real de la tarjeta (que sí seguía ahí,
`rounded-3xl border`) quedaba invisible y las flechas centradas en el alto
total de la tarjeta parecían flotar en la nada.

Cambios:

- `features/flash-cards/components/flash-card-student-card.tsx`: la
  tarjeta ahora tiene dos zonas con límite SIEMPRE visible
  (`overflow-hidden rounded-3xl border shadow-sm` en el contenedor): un
  encabezado con la franja de color de la categoría (mascota + badge +
  título) y un cuerpo `bg-surface` plano con el contenido — el corte entre
  "esto es la tarjeta" y "esto es la página" ya no depende de qué tan
  larga sea la descripción.
- `features/flash-cards/components/flash-card-deck.tsx`: se quitaron las
  flechas flotantes superpuestas al carrusel (`absolute ... top-1/2`) —
  eran redundantes con el swipe nativo de Embla, los chips de categoría, el
  stepper y los botones Anterior/Siguiente, y con alto de tarjeta variable
  nunca iban a tener una posición visualmente consistente.
- `components/ui/step-progress.tsx`: rediseño — barra de progreso general
  animada (ancho con spring) arriba de los pasos; círculos más grandes
  (7×7 en vez de 6×6) con halo (`ring-4`) y ligero aumento de escala en el
  paso activo; el número/check dentro de cada círculo entra con
  `AnimatePresence` (pop); cada segmento de línea entre pasos se "llena"
  animado (`scaleX` desde el origen izquierdo) al completarse, en vez de
  solo cambiar de color de golpe; el contador "3/6" ahora es una píldora en
  vez de texto plano. Sigue siendo compartido con `TestTaker` — mismos
  props, cambio puramente visual/de animación.

### Verificación

- `npm run lint`: 0 errores (mismas 5 advertencias preexistentes).
- `npx tsc --noEmit`: sin errores de tipos.

## Cuarto ajuste: tarjeta en dos paneles y stepper propio del mazo

El usuario pidió (otra vez con la referencia del stepper tipo "wizard")
mejor diseño de tarjeta y stepper, y que la vista se acople al ancho de la
pantalla: con `max-w-2xl` quedaba una columna angosta con mucho espacio
muerto a los lados en escritorio, y seguían siendo dos filas separadas
(chips de categoría + stepper numérico) mostrando lo mismo.

Cambios:

- `features/flash-cards/components/flash-card-stepper.tsx` (nuevo):
  stepper propio del mazo que REEMPLAZA a la fila de chips + `StepProgress`.
  Un paso por tarjeta: caja redondeada con la mascota de su categoría y una
  insignia de número (check cuando ya se pasó). El paso activo se expande
  mostrando el nombre de la categoría y se tiñe con su tono — la
  expansión/colapso y el reacomodo de la fila los anima Framer Motion con
  `layout` + `AnimatePresence`. Scroll horizontal en pantallas angostas,
  con el paso activo traído a la vista solo cuando el usuario navega (no en
  el primer render). `StepProgress` (components/ui) se queda como está para
  `TestTaker`: aquel es genérico y numérico; este muestra mascota y
  categoría, propios de flashcards.
- `features/flash-cards/components/flash-card-student-card.tsx`: la
  tarjeta ahora se parte en dos paneles — mascota + badge a la izquierda
  (ancho fijo `lg:w-72`, fondo con el tono plano de la categoría) y
  título + contenido a la derecha. Abajo de `lg` se apila (mascota arriba).
  Así el ancho disponible en escritorio se usa de verdad, en vez de dejar
  la tarjeta como una columna angosta centrada.
- `features/flash-cards/components/flash-card-type-badge.tsx`: nueva prop
  `variant` (`soft` por defecto | `contrast`). La tarjeta usa `contrast`
  porque su panel ya ES el tono suave de la categoría, donde la pastilla
  `soft` quedaría invisible. La tabla del docente sigue usando `soft`, sin
  cambios.
- `features/flash-cards/components/flash-card-deck.tsx`: contenedor
  `max-w-2xl` → `max-w-6xl`; se quitó la fila de chips (ya cubierta por el
  stepper); slides con `items-stretch` para que todas las tarjetas del mazo
  tengan la misma altura; botones Anterior/Siguiente con ancho mínimo
  parejo, apilados en mobile.

### Verificación

- `npm run lint`: 0 errores (mismas 5 advertencias preexistentes).
- `npx tsc --noEmit`: sin errores de tipos.

## Quinto ajuste: flechas de navegación en mobile

En mobile la tarjeta es alta (mascota + título + texto + imagen), así que
los botones Anterior/Siguiente del final quedan fuera de pantalla y el
swipe de Embla no es una afordancia visible. Se agregaron flechas
circulares (`bg-surface/90` + borde + sombra, no el círculo oscuro de
antes) centradas sobre la franja de la mascota, ocultas desde `lg` — ahí
la tarjeta es horizontal y los botones de abajo ya se ven.

Para que su posición sea estable entre tarjetas (el problema que tenían
las flechas anteriores, centradas en el alto total de una tarjeta
variable), la franja de la mascota ahora tiene alto fijo en mobile
(`h-56`, `lg:h-auto`) y las flechas se anclan con `top-28`.

## Sexto ajuste: avatar de la mascota en el chatbot

El chatbot mostraba íconos genéricos de Lucide (`Sparkles` en el
encabezado, `Bot` en cada burbuja y en el indicador de "escribiendo") en
vez de la mascota EcoGuía, que sí se usa en la práctica de speaking y en la
landing.

- `components/ui/eco-guide-avatar.tsx` (nuevo): avatar circular de la
  mascota (`public/eco-avatar.png`), recortado con `object-top` para que se
  vea la cara. Vive en `components/ui` porque lo comparten varias features.
- `features/chatbot-conversations/components/chat-window.tsx`: el
  encabezado usa el avatar (40px) con el puntito verde de "en línea"
  superpuesto (solo mientras la conversación no esté finalizada).
- `features/chatbot-conversations/components/chat-message-bubble.tsx` y
  `typing-indicator.tsx`: avatar de 28px en lugar del ícono `Bot`.

Verificación: `npm run lint` 0 errores, `npx tsc --noEmit` sin errores.
