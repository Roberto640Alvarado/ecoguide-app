# Rediseño del examen del estudiante (TestTaker) y fix del stepper

## Objetivo

El usuario pidió mejor diseño para la parte del examen donde se cargan las
preguntas y respuestas, con buenas animaciones. En la captura también se
veía un defecto del stepper: el halo del paso activo salía cortado, como un
rectángulo en vez de un círculo.

## Cambios realizados

`features/student-tests/components/test-taker.tsx`:

1. Transición entre preguntas direccional con `AnimatePresence`
   (`mode="wait"` + `custom={direction}`): la pregunta entra desde el lado
   hacia el que se navega y sale hacia el contrario, así avanzar y
   retroceder se sienten distintos. Antes solo hacía un fade + desplazamiento
   fijo, sin animación de salida.
2. Las opciones entran escalonadas detrás de la pregunta
   (`staggerChildren` en las variantes del contenedor).
3. Rediseño de las opciones: cada una es una tarjeta con borde de 2px,
   insignia de letra (A/B/C/D) a la izquierda y un indicador circular de
   selección a la derecha, con el check entrando con un spring. Antes eran
   filas planas donde lo único que cambiaba al seleccionar era el color del
   borde.
4. Encabezado de la tarjeta de pregunta: píldora "Pregunta N / Total" y una
   etiqueta "Respondida" que aparece animada cuando esa pregunta ya tiene
   respuesta.
5. Pie: barra de avance de respuestas animada (`width` con spring) junto al
   contador, en vez del contador suelto entre los dos botones. Botones con
   ancho mínimo parejo y feedback de hover/tap.
6. "Anterior" deshabilitado ahora se ve al 40% de opacidad en vez de
   `opacity-0` (un botón invisible confunde).
7. En la última pregunta, si faltan respuestas, se muestra cuántas faltan —
   antes el botón "Enviar examen" solo quedaba apagado sin explicar por qué.
8. El contenido se centra con `max-w-4xl` para que las líneas de pregunta y
   opción no se estiren de lado a lado en monitores anchos.

`components/ui/step-progress.tsx`: el `<ol>` tenía `overflow-x-auto` con
`py-1`. `overflow-x-auto` también recorta en el eje vertical, así que el
`ring-4` y la escala del paso activo salían cortados arriba y abajo (de ahí
el "rectángulo" en la captura). Se subió a `py-2.5`.

`app/student/protected-areas/[id]/test/page.tsx`: `Spinner` de
`@heroui/react` → `Loader2` de `lucide-react`, mismo patrón que el resto de
vistas migradas.

## Verificación

- `npm run lint`: 0 errores (mismas 5 advertencias preexistentes de
  `react-hooks/incompatible-library`).
- `npx tsc --noEmit`: sin errores de tipos.

## Ajuste: reporte de "no hace scroll en móvil" en la vista de resultados

El usuario reportó que en móvil no puede hacer scroll en `TestResults`. No
se pudo reproducir desde este entorno (la vista está detrás de login y no
hay credenciales acá), y la revisión del código no encontró la causa
directa: no hay `overflow-hidden` ni contenedor de alto fijo en la cadena
(`SidebarProvider` → `SidebarInset` → página), el canvas de
`canvas-confetti` se crea con `pointer-events: none` y se remueve al
terminar, y `ModalRoot` de HeroUI no renderiza nada (ni bloqueo de scroll)
mientras está cerrado.

Se eliminaron los tres sospechosos que sí dependen de este componente, todos
cambios defendibles por sí mismos:

- `BadgeUnlockDialog` ahora se monta solo cuando hay una insignia que
  celebrar (`justUnlocked.length > 0`), en vez de quedar siempre montado
  con `badge={null}` — así no hay maquinaria de overlay de react-aria en la
  vista el 99% del tiempo.
- El ícono de la nota cuando NO se aprueba rebotaba con
  `repeat: Infinity`; pasa a `repeat: 3`. Una animación que nunca termina
  mantiene el hilo principal ocupado de forma indefinida, que en móvil se
  percibe como scroll trabado.
- El botón de reintentar pasa del `Button` de `@heroui/react` (gestos de
  puntero vía react-aria) al `Button` de shadcn/ui, igual que el resto de
  vistas migradas.
- De paso, los resultados se centran con `max-w-4xl`, igual que `TestTaker`.

Si el problema persiste, el siguiente paso es pedirle al usuario la salida
de este snippet en la consola, con la vista de resultados abierta en
tamaño móvil — distingue entre contenido recortado, bloqueo de scroll y
overlay invisible:

```js
const el = document.scrollingElement;
({
  htmlOverflow: getComputedStyle(document.documentElement).overflow,
  bodyOverflow: getComputedStyle(document.body).overflow,
  bodyPosition: getComputedStyle(document.body).position,
  scrollHeight: el.scrollHeight,
  clientHeight: el.clientHeight,
  encima: document.elementFromPoint(innerWidth / 2, innerHeight / 2)?.className,
})
```
