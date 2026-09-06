# Rediseño del detalle de un proveedor de IA

## Objetivo

El detalle de un proveedor (`/teacher/ai-providers/[id]`) tenía todo
amontonado en una sola fila (ícono + nombre + badge + Editar + switch sin
etiqueta) y la lista de modelos mostraba el nombre y el identificador
técnico como texto plano casi idéntico, sin ninguna jerarquía visual. El
usuario pidió un mejor diseño, más intuitivo, con mejor UX/UI y responsive.

## Cambios realizados

`app/teacher/ai-providers/[id]/page.tsx` (migrado de `@heroui/react` a los
componentes de shadcn/ui — `Button`, `Loader2` en vez de `Spinner` — para
consistencia con el resto de vistas ya migradas):

1. Tarjeta de identidad del proveedor: se separó en dos bloques con un
   `border-t` entre ellos — arriba "quién es" (ícono, nombre, badge de
   estado, conteo de modelos), abajo "qué se puede hacer" (estado del
   proveedor + botón "Editar proveedor"). El switch de activar/desactivar
   ahora lleva su propia etiqueta ("Estado del proveedor") en vez de
   quedar suelto sin contexto.
2. Encabezado de "Catálogo de modelos": se le agregó una descripción corta
   y el botón "Agregar modelo" es responsive (ancho completo en mobile,
   automático en pantallas más grandes).
3. Cada fila de modelo ahora tiene un ícono (`Sparkles` en una insignia
   `bg-primary/10`, mismo patrón que el ícono de proveedor en la tabla de
   listado) para dar apoyo visual al escanear la lista, y el identificador
   técnico del modelo se muestra en `font-mono` — así se distingue del
   nombre visible incluso cuando ambos textos son iguales (antes se veían
   como una duplicación accidental).
4. Botones de Editar/Eliminar por modelo: `rounded-full` + `size="icon-sm"`
   para que combinen con el resto de botones de acción circulares ya
   usados en las tablas de listado.
5. `features/ai-providers/components/remove-model-button.tsx`: su trigger
   pasa de `Button` de `@heroui/react` a shadcn `Button`, con el mismo
   `rounded-full`.

## Pendiente / no tocado en esta ronda

`EditProviderModal` y `ModelFormModal` siguen usando `Button`/`Spinner` de
`@heroui/react` en sus botones internos (Cancelar/Guardar) — no se tocaron
porque no aparecían en las capturas ni fueron parte de lo pedido, y
CLAUDE.md pide migrar "vista por vista". Queda como un pendiente conocido
para una futura ronda si se quiere terminar de sacar HeroUI de este
feature.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`).
- `npm run build`: compila y type-checkea sin errores.

## Ajuste posterior

Los botones de "Editar"/"Eliminar" en cada modelo eran solo íconos
(circulares, sin texto visible) — se agregó el texto correspondiente junto
al ícono en ambos (`app/teacher/ai-providers/[id]/page.tsx` y
`features/ai-providers/components/remove-model-button.tsx`), para que se
entienda de un vistazo qué hace cada botón, igual que ya ocurre con las
acciones de las tablas de listado.
