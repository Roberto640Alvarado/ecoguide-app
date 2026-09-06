# Rediseño sistémico del color y hover de los botones (shadcn Button)

## Objetivo

El usuario pidió revisar y corregir los colores de hover de los botones
primarios, secundarios y los que implican eliminar en toda la app,
tomando en cuenta que se vean bien tanto en tema claro como en tema
oscuro. El disparador fue el bug del botón "Eliminar" (fondo verde +
texto rojo en el hover) reportado en la ronda anterior — pero en vez de
seguir parchando botón por botón, se corrigió la causa raíz: el
componente compartido `components/ui/button.tsx` (usado por todos los
botones ya migrados a shadcn) tenía hovers genéricos de la plantilla de
shadcn (basados en opacidad u overrides fijos) que no usaban la paleta de
marca del proyecto ni distinguían tema claro/oscuro correctamente.

## Hallazgo clave

El proyecto ya trae, vía `@import "@heroui/styles"` en `app/globals.css`,
un set completo de tokens de hover **calculados y ya theme-aware** que
HeroUI define para su propio sistema de diseño: `--accent-hover`,
`--danger-hover`, `--surface-hover`, `--accent-soft-hover`,
`--danger-soft-hover`, etc. Cada uno se calcula con `color-mix()` a
partir del color base y su color de texto (ej. `--accent-hover:
color-mix(in oklab, var(--accent) 90%, var(--accent-foreground) 10%)`),
y HeroUI los redefine tanto en su bloque de tema claro como en el de tema
oscuro. Como `app/globals.css` sobreescribe `--accent`/`--danger`/
`--surface` con los colores de marca (Sea Green, etc.) tanto en
`:root`/`[data-theme="light"]` como en `.dark`/`[data-theme="dark"]`,
estos hovers calculados automáticamente heredan la marca en ambos temas
sin necesidad de definir una paleta paralela — solo faltaba que
`button.tsx` los usara.

## Cambios realizados

`app/globals.css` — se agregaron 3 alias nuevos al bloque `@theme
inline` (mismo patrón que los alias ya existentes de esa sección):
- `--color-primary-hover: var(--accent-hover);`
- `--color-destructive-hover: var(--danger-hover);`
- `--color-surface-hover: var(--surface-hover);` (alias directo; ya
  existían alias indirectos como `--color-layer-hover`, pero ninguno
  exponía `--surface-hover` en sí como utilidad de Tailwind).

`components/ui/button.tsx` — se reescribieron los hovers de cada
`variant` para usar esos tokens en vez de los genéricos de la plantilla:
- **`default` (primario)**: `hover:bg-primary/90` → `hover:bg-primary-hover`.
  Antes era solo una atenuación de opacidad del mismo verde; ahora usa el
  tono ya calculado por HeroUI para dar una sensación de profundidad
  consistente en ambos temas.
- **`destructive`**: `bg-destructive text-white hover:bg-destructive/90
  ... dark:bg-destructive/60 ...` → `bg-destructive
  text-destructive-foreground hover:bg-destructive-hover
  focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40`.
  Se quitó el parche `dark:bg-destructive/60` (ya no hace falta: el
  token `--danger` de HeroUI ya trae su propio valor ajustado para tema
  oscuro) y se cambió `text-white` por el token semántico
  `text-destructive-foreground`.
- **`outline`**: `hover:bg-accent hover:text-accent-foreground` (el
  causante del bug: llenaba el botón de verde y forzaba el texto a
  blanco, chocando con cualquier color de texto propio como el rojo de
  "Eliminar") → `hover:bg-surface-hover`, sin forzar el color de texto.
  Ahora el hover es un tinte neutro sutil (el mismo que ya se usaba en
  filas de tabla/sidebar vía `hover:bg-layer-hover`), y cualquier botón
  con un color de texto propio (ej. "Eliminar" en rojo) lo conserva en
  el hover en vez de que se lo pise el accent verde.
- **`secondary`**: `hover:bg-secondary/80` → `hover:bg-secondary-hover`
  (token que ya existía en el proyecto pero no se usaba en este
  componente).
- **`ghost`**: `hover:bg-accent hover:text-accent-foreground
  dark:hover:bg-accent/50` → `hover:bg-surface-hover` (una sola clase
  cubre ambos temas, ya no hace falta el override `dark:`).

Los botones de "Eliminar" en tablas (`remove-badge-button.tsx`,
`remove-flash-card-button.tsx`, de la ronda anterior) ya tenían su propio
hover rojo (`hover:bg-danger-soft hover:text-danger-soft-foreground`)
que sigue funcionando igual — y ahora, al ya no chocar con el
`hover:bg-accent` heredado del variant `outline`, se ve limpio sin
necesidad de cambios adicionales.

## Por qué esto resuelve "primarios, secundarios y eliminar" a la vez

Como todos los botones ya migrados a shadcn en la app usan este mismo
`components/ui/button.tsx`, el arreglo aplica de una sola vez a: todos
los CTA primarios ("Nueva insignia", "Guardar", "Crear proveedor"...),
todos los "Cancelar"/"Editar" (`variant="outline"`), los botones
secundarios, y sirve de base correcta para cualquier botón de eliminar
que use `variant="destructive"` en el futuro — sin tener que repetir la
corrección botón por botón cada vez que aparezca un caso nuevo.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`, sin cambios).
- `npm run build`: compila, type-checkea y genera todas las páginas sin
  errores.
- Se inspeccionó el CSS generado (`.next/static/chunks/*.css`) para
  confirmar que Tailwind generó las utilidades nuevas apuntando a las
  variables CSS (no a colores fijos), ej.:
  `.hover\:bg-primary-hover:hover{background-color:var(--accent-hover)}` —
  confirma que el hover queda ligado a los tokens de tema y por lo tanto
  se ajusta automáticamente entre claro y oscuro.
