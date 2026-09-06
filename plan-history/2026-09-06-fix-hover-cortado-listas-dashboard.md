# Fix: hover "cortado" en las listas del panel de docente

## Objetivo

El usuario mandó captura de las 4 tarjetas de lista del dashboard
("Estudiantes recientes", "Borradores por publicar", "Publicadas
recientemente", "Proveedores de IA") — al pasar el mouse por una fila
(se ve en la captura sobre "Nancy Ramirez"), el rectángulo de hover se
veía "cortado".

## Causa

Las 4 listas usaban el mismo patrón: `<ul className="flex flex-col
divide-y divide-border">` (línea divisoria recta, de borde a borde, entre
cada fila) combinado con un `<Link>` por fila con `rounded-lg
hover:bg-layer-hover` (rectángulo de hover con esquinas redondeadas). El
resultado: la línea divisoria recta atraviesa justo donde el rectángulo
de hover tiene la esquina redondeada, así que en cada esquina se ve como
si el fondo del hover se cortara/truncara antes de llegar al borde —
exactamente el efecto "cortado" de la captura.

## Cambios realizados

`app/teacher/dashboard/page.tsx` — mismo cambio aplicado a las 4 listas
(Estudiantes recientes, Borradores por publicar, Publicadas
recientemente, Proveedores de IA):

- Se quitó `divide-y divide-border` del `<ul>` (ya no hay línea recta que
  choque con las esquinas redondeadas) y se reemplazó por `gap-1` —el
  espacio entre filas ahora es aire en vez de una línea.
- Cada fila (`<Link>`) ganó `-mx-2 px-2` (antes no tenía padding
  horizontal): el texto queda alineado exactamente donde estaba antes
  (el padding compensa el margen negativo), pero el rectángulo de hover
  ahora es una píldora completa con las 4 esquinas limpias, sin nada que
  la atraviese.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`, sin cambios).
- `npm run build`: compila y genera todas las páginas sin errores.
