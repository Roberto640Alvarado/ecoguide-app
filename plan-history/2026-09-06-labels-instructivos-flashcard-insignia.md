# Labels instructivos en formularios de flashcard e insignia

## Objetivo

Aplicar a los formularios de crear/editar flashcard e insignia el mismo
tratamiento que ya se validó (con corrección incluida) en el formulario de
área protegida: cada sección debe llevar una descripción instructiva
("ingresa la descripción...", "carga a continuación las imágenes...") en
vez de depender solo de placeholders, y la subida de imagen debe ser más
intuitiva (soportar arrastrar-y-soltar).

## Cambios realizados

`features/flash-cards/components/flash-card-form.tsx`:
- Migrado de `Button`/`Spinner` de `@heroui/react` a `Button` (shadcn) +
  `Loader2` (lucide), consistente con el resto de formularios ya
  migrados.
- La sección "Contenido" (`FormSection`) ahora tiene `description`:
  "Elige la categoría, escribe el título y el contenido que verá el
  estudiante." ("Choose the category, write the title and the content the
  student will see." en inglés).
- Sobre `<FlashCardImageUploader>` se agregó una línea instructiva:
  "Carga una imagen opcional para esta tarjeta." ("Upload an optional
  image for this card.").
- La sección "Pregunta de opción múltiple" ahora tiene `description`:
  "Solo para la categoría Ambiental: escribe la pregunta, las opciones de
  respuesta y marca cuál es la correcta." (equivalente en inglés).
- Botones Cancelar/Guardar migrados a shadcn, responsive (ancho completo
  en mobile).

`features/badges/components/badge-form.tsx`:
- Mismo swap de `@heroui/react` a shadcn `Button` + `Loader2`.
- La sección "Insignia" (`FormSection`) ahora tiene `description`:
  "Ingresa el nombre, la descripción y el mensaje que verá el estudiante
  al ganarla." (equivalente en inglés).
- Sobre `<BadgeImageUploader>` se agregó: "Carga la imagen PNG de esta
  insignia." ("Upload the PNG image for this badge.").
- Botones Cancelar/Guardar migrados a shadcn, responsive.

`features/flash-cards/components/flash-card-image-uploader.tsx` y
`features/badges/components/badge-image-uploader.tsx`: el tile de 96x96
para agregar imagen (se mantiene ese tamaño compacto en ambos, a
diferencia de la dropzone de ancho completo de ProtectedAreas, porque acá
convive con un campo de texto en una grilla de 2 columnas) ahora soporta
arrastrar-y-soltar real:
- La validación (tipo MIME permitido, tamaño máximo) se extrajo a una
  función `processFile(file)` compartida entre el `<input type="file">`
  y el drop.
- Nuevo estado `isDraggingOver`; el botón cambia de borde/fondo mientras
  se arrastra un archivo encima (`border-accent bg-accent-soft/40`).
- `onDragOver`/`onDragLeave`/`onDrop` en el botón; `onDrop` ignora el
  intento si ya hay una subida en curso (`uploadImage.isPending`).
- Sin cambios en las reglas de validación existentes (flashcard: JPEG/PNG/
  WEBP hasta 5 MB; insignia: solo PNG hasta 2 MB).

## Verificación

- `npm run lint`: 0 errores (solo las 5 advertencias preexistentes de
  `react-hooks/incompatible-library`, sin cambios).
- `npm run build`: compila, type-checkea y genera todas las páginas sin
  errores.
