# Rediseño del formulario de crear/editar área protegida

## Objetivo

El usuario pidió que el formulario de crear/editar una reserva (área
protegida) tuviera labels/instrucciones más claras — especialmente en la
zona de imágenes — que fuera más intuitivo, y que se mantuviera responsive.

## Cambios realizados

`components/ui/toggle-field.tsx` (componente compartido, también usado por
"Activo" en los modales de proveedor/modelo de IA): se agregó un prop
opcional `description` — texto de apoyo debajo del label del switch. No
rompe a los demás consumidores (sin el prop, se comportan igual que antes).
Se usa en "Publicada" del formulario de área protegida: "Visible para los
estudiantes de inmediato."

`features/protected-areas/components/image-uploader.tsx`: antes, el único
punto de entrada para subir una imagen (cuando no había ninguna) era un
botón "+" de 96x96 sin ninguna instrucción visible — nada indicaba que se
podía hacer click ahí, y el formato/tamaño permitido solo se veía en una
leyenda pequeña debajo. Ahora, mientras el área no tenga imágenes, se
muestra una dropzone completa (`border-dashed`, ancho completo) con:
- Ícono + "Arrastra tus imágenes aquí o haz clic para seleccionarlas".
- El detalle de formato/tamaño dentro de la propia dropzone, no solo como
  nota aparte.
- Soporte real de arrastrar-y-soltar (`onDragOver`/`onDrop`), además del
  click; antes "arrastra" no estaba implementado en ningún lado del
  uploader (solo el mapa lo mencionaba, para el pin).
Una vez que ya hay al menos una imagen, se mantiene el grid de miniaturas +
un tile "+" más discreto para agregar más, igual que antes.

`features/protected-areas/components/protected-area-form.tsx`:
- Los placeholders de "Nombre" y "Descripción" ahora llevan el prefijo
  "Ej:" ("E.g." en inglés) para que quede claro que son un ejemplo, no un
  valor real ya cargado.
- Migrado de `Button`/`Spinner` de `@heroui/react` a los de shadcn/ui
  (`Button` + `Loader2`), consistente con el resto de formularios ya
  migrados esta sesión.
- Los botones de Cancelar/Guardar al final del formulario ahora son
  responsive (ancho completo en mobile, automático en pantallas grandes).

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`, sin cambios).
- `npm run build`: compila y type-checkea sin errores.
