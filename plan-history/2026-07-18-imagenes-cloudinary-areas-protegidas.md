# Imágenes de áreas protegidas con Cloudinary

## Objetivo

Permitir que el docente suba imágenes a las áreas protegidas (al crear y al editar) usando
Cloudinary, y mostrar la primera imagen como portada en las cards del listado.

## Cambios realizados

### Backend (`ecoguide-api`)

- Se instaló `@types/multer` (faltaba como devDependency; `cloudinary` y `multer` ya estaban
  presentes en `node_modules`, y `.env` ya tenía las credenciales de Cloudinary configuradas —
  el schema de Prisma incluso documenta `images String[] // URLs de Cloudinary`, así que el
  proyecto ya apuntaba a Cloudinary aunque el `CLAUDE.md` mencionara Cloudflare R2).
- Nuevo módulo `src/upload-files/` (controller + service + doc, sin repository porque no persiste
  nada en base de datos):
  - `POST /upload-files?folder=<subcarpeta>`, restringido a `TEACHER`, recibe un archivo
    (`multipart/form-data`, campo `file`) vía `FileInterceptor`, valida tipo (JPEG/PNG/WEBP) y
    tamaño (máx. 5 MB), lo sube a Cloudinary (carpeta `ecoguide/<subcarpeta>`) y devuelve
    `{ url }`.
  - Es un endpoint genérico: cualquier módulo futuro (FlashCards, etc.) puede reutilizarlo pasando
    su propia `folder`.
- Registrado en `app.module.ts`.

### Frontend (`ecoguide-app`)

- `features/protected-areas/schemas/protected-area.schema.ts`: se agregó `images: string[]`
  (URLs, máximo 10) al esquema compartido de crear/editar.
- `features/protected-areas/api/protected-areas.api.ts`: `uploadProtectedAreaImage(file)` — arma
  un `FormData` y lo envía a `/upload-files?folder=protected-areas`; Axios detecta el `FormData` y
  deja que el navegador fije el `Content-Type` con el boundary correcto (no se sobreescribe a
  mano).
- `features/protected-areas/hooks/use-upload-protected-area-image.ts`: mutación de subida.
- `features/protected-areas/components/image-uploader.tsx`: grid de miniaturas con botón de
  quitar (aparece al hover) + una casilla "Agregar" que abre el selector de archivos; valida tipo
  y tamaño en el cliente antes de subir, muestra spinner mientras sube y bloquea la casilla al
  llegar a 10 imágenes.
- `features/protected-areas/components/protected-area-form.tsx`: se integró `ImageUploader` entre
  la descripción y el toggle de publicación; `images` se agregó a los `defaultValues` (arreglo
  vacío al crear).
- `app/teacher/protected-areas/[id]/edit/page.tsx`: pasa `area.images` como valor inicial.
- `features/protected-areas/components/protected-area-card.tsx`: la card ahora muestra
  `images[0]` como portada (con `next/image`, `fill` + `object-cover`) en vez del ícono fijo; si
  el área no tiene imágenes, mantiene el ícono de `MapPinned` como placeholder. El badge de estado
  se movió sobre la portada.
- `next.config.ts`: se agregó `images.remotePatterns` para `res.cloudinary.com`, requerido por
  `next/image` para optimizar imágenes de un dominio externo.

## Razones del cambio

- El endpoint de subida se hizo genérico y sin persistencia propia porque ni el schema de Prisma
  ni el `CLAUDE.md` contemplan una colección `upload_files`: cada módulo dueño del recurso
  (ProtectedAreas) es responsable de guardar la URL en su propio campo `images`.
- Se subió una imagen a la vez (no un formulario `<input multiple>` con subida en lote) para poder
  mostrar progreso individual y permitir seguir agregando imágenes sin volver a tocar las ya
  subidas.

## Resultado final

- `npx tsc --noEmit` sin errores en `ecoguide-api` (con `--incremental false` para evitar un error
  de escritura del `.tsbuildinfo` propio del sandbox, no relacionado con el código) y en
  `ecoguide-app`.
- Persiste la misma limitación documentada en el plan anterior: no fue posible correr
  `npx eslint` en este entorno (node_modules de OneDrive con el binario de ESLint incompleto).
  Se recomienda `npm install && npm run lint` en ambos repos desde Windows antes de cerrar la
  tarea.
- El docente ya puede agregar y quitar imágenes de un área protegida al crearla o editarla, y el
  listado de áreas muestra la primera imagen como portada de cada card.
