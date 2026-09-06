# Labels visibles en los botones de acción de las tablas de Flashcards e Insignias

## Objetivo

En las tablas de Flashcards e Insignias, los botones de "Editar" y
"Eliminar" en la columna de acciones eran solo un ícono (pencil / trash)
sin texto visible — dependían únicamente del `aria-label` para explicar
qué hacían. El usuario pidió nombres más intuitivos en esos botones.

## Cambios realizados

`app/teacher/protected-areas/[id]/badges/page.tsx` y
`app/teacher/protected-areas/[id]/flash-cards/page.tsx`: el botón
"Editar" (ícono `SquarePen`) ahora muestra también el texto "Editar" /
"Edit", igual que ya se hacía en las tablas de Proveedores de IA y
Usuarios/Docentes.

`features/badges/components/remove-badge-button.tsx` y
`features/flash-cards/components/remove-flash-card-button.tsx`: el botón
"Eliminar" (ícono `Trash2`) ahora muestra también el texto "Eliminar" /
"Delete", con color `text-danger` para dejar claro que es una acción
destructiva (mismo tratamiento que el ícono de "Eliminar pregunta" en el
constructor de tests). De paso, ambos quedaron migrados de `Button` de
`@heroui/react` a `Button` de shadcn — el trigger de `ConfirmDialog` usa
`Pressable` de react-aria-components para interceptar el click sin
importar qué componente de botón se le pase, así que el cambio no afecta
el comportamiento del diálogo de confirmación.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`, sin cambios).
- `npm run build`: compila, type-checkea y genera todas las páginas sin
  errores.

## Ajuste posterior: color de hover del botón "Eliminar"

El usuario mandó captura mostrando que, al pasar el mouse sobre "Eliminar",
el botón se ponía verde (color `hover:bg-accent` heredado del `variant`
"outline") con el texto rojo (`text-danger` fijo que le habíamos puesto) —
una combinación de colores que no tenía sentido.

Se reemplazó el hover heredado por uno propio en tono rojo, consistente
con el patrón ya usado en `components/ui/options-list-field.tsx` para su
botón de "quitar opción":

`features/badges/components/remove-badge-button.tsx` y
`features/flash-cards/components/remove-flash-card-button.tsx`:
`className="border-danger/30 text-danger hover:border-danger
hover:bg-danger-soft hover:text-danger-soft-foreground"` — en reposo el
botón ya se ve con borde/texto rojo tenue, y al pasar el mouse el fondo se
llena con el rojo suave (`bg-danger-soft`) en vez del verde de acento.

Verificado con `npm run lint` y `npm run build` (limpios, sin errores).
