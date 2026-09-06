# Ajustes al toolbar de fecha y responsive en Estudiantes/Docentes

## Objetivo

Pulir el toolbar agregado en la ronda anterior (filtro de fecha +
"Limpiar filtros" arriba de la tabla) y confirmar que las vistas de
Estudiantes/Docentes se ven bien en pantallas angostas.

## Cambios realizados

1. `components/ui/date-range-filter.tsx`: el placeholder por defecto ahora
   viene del caller (antes "Filtrar por fecha de registro" / "Filter by
   join date", ahora "Fecha de registro" / "Join date" — mismo texto que
   el título del popover, más corto). Se agregó un prop opcional
   `className` para poder ajustar el ancho del trigger por instancia; el
   trigger ahora es `w-full` por defecto (antes solo tenía `sm:w-64`, sin
   ancho definido en mobile).
2. `features/users/components/user-list-page.tsx`:
   - Botón "Limpiar filtros": `variant="ghost"` → `variant="outline"`, para
     que se vea como un botón real (con borde) en vez de texto apagado
     casi invisible.
   - Toolbar: `flex flex-wrap items-center gap-2` → `flex flex-col gap-2
     sm:flex-row sm:flex-wrap sm:items-center` — en mobile el filtro de
     fecha y "Limpiar filtros" se apilan verticalmente, cada uno a ancho
     completo (más fácil de tocar); en `sm:` y arriba vuelven a la fila
     horizontal de siempre.

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`).
- `npm run build`: compila y type-checkea sin errores.
