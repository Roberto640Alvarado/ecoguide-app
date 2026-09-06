# Mejora de filtros en Áreas protegidas + fix del bug real de estado (backend)

## Objetivo

El usuario pidió mejorar el diseño de los filtros de "Áreas protegidas" y
corregir el filtro de estado, que no filtraba bien (Publicada/Borrador
devolvían lo mismo).

## Causa raíz encontrada

El bug no estaba en el frontend: en `ecoguide-api`, el DTO que valida
`isPublished` (y lo mismo en `isActive` de Proveedores de IA) usaba
`@Type(() => Boolean)` de class-transformer, que internamente hace
`Boolean(value)` — y `Boolean("false")` es `true` en JS, porque cualquier
string no vacío es "truthy". Resultado: `?isPublished=false` y
`?isPublished=true` se comportaban igual en el backend.

Al investigar esto until encontré que el mismo bug ya afectaba el filtro
de Estado de Proveedores de IA (agregado hace unas rondas), y que el
backend de Usuarios ni siquiera tenía implementados los filtros de
Estado/Fecha que le agregamos a Estudiantes/Docentes — como el
`ValidationPipe` global tiene `forbidNonWhitelisted: true`, esas peticiones
probablemente fallaban con 400 en vez de simplemente ignorar el filtro.
Se lo planteé al usuario y pidió corregir los tres.

## Cambios en `ecoguide-api`

- **Nuevo** `src/common/decorators/is-optional-boolean.decorator.ts`:
  decorador `@IsOptionalBoolean()` que interpreta explícitamente los
  strings `"true"`/`"false"` de un query string antes de validarlos como
  boolean (en vez de la trampa de `@Type(() => Boolean)`). Reemplaza el uso
  de `@Type(() => Boolean) @IsBoolean()` en:
  - `protected-areas/dto/find-protected-areas-query.dto.ts` (`isPublished`)
  - `ai-providers/dto/find-ai-providers-query.dto.ts` (`isActive`)
  - `users/dto/find-users-query.dto.ts` (`isActive`, nuevo campo)
- **Nuevo** `src/common/utils/date-range.util.ts`: `buildDateRangeFilter(from?, to?)`
  construye el `{ gte, lte }` de Prisma a partir de dos strings
  "yyyy-MM-dd" opcionales, llevando `to` al final de ese día (23:59:59.999)
  para que sea inclusivo. Se usa igual en los tres repositorios de abajo.
- `users`: se agregaron `isActive`, `createdFrom`, `createdTo` de punta a
  punta — no existían en absoluto en el backend (ni en el DTO, ni en
  `FindUsersParams`, ni en el `where` de `UsersRepository.findAll`) pese a
  que la UI de Estudiantes/Docentes ya los enviaba.
- `ai-providers`: se agregó el mismo trío `createdFrom`/`createdTo`
  (faltaban por completo) además del fix de `isActive`.
- `protected-areas`: se agregó `createdFrom`/`createdTo` (antes solo tenía
  `isPublished`, ahora con el fix de boolean).
- Se documentaron los nuevos query params con `@ApiQuery` en los tres
  controllers.

## Cambios en `ecoguide-app`

- `features/protected-areas/types/protected-area.types.ts`: se agregan
  `createdFrom`/`createdTo` a `FindProtectedAreasParams`.
- `app/teacher/protected-areas/page.tsx`: rediseño de la barra de filtros —
  ahora vive dentro de una tarjeta (`rounded-2xl border`) en vez de flotar
  suelta sobre el grid, con el buscador arriba a ancho completo y, abajo,
  estado + fecha de creación (`DateRangeFilter`, reusado de Estudiantes/
  Docentes/Proveedores) + orden + "Limpiar filtros" + "Nueva área" (esta
  última se movió aquí también, dentro del bloque de filtros, siguiendo el
  mismo patrón que "Nuevo proveedor" en Proveedores de IA). Todo colapsa a
  columna en mobile.

## Verificación

- Frontend: `npm run lint` y `npm run build` sin errores nuevos (solo las
  5 advertencias preexistentes de siempre).
- Backend: `npm run build` (tsc vía `nest build`) sin errores; `npx eslint`
  sobre todos los archivos tocados sin errores. Verifiqué manualmente con
  un script `ts-node` que `@IsOptionalBoolean()` interpreta correctamente
  `"true"`/`"false"`/ausente en los tres DTOs, y que `buildDateRangeFilter`
  arma el rango `{gte, lte}` esperado.
- **No pude correr `npm test` (Jest) en el backend** — falla con "Module
  ts-jest in the transform option was not found", un problema preexistente
  y no relacionado (parece un desajuste de versiones jest 30 / ts-jest 29
  ya presente antes de mis cambios, no algo que haya roto yo). Lo señalo
  como pendiente para el usuario; no lo toqué por ser una configuración de
  testing ajena a este pedido.

## Nota

Tuve que pedir permiso para borrar archivos dentro de la carpeta de
`ecoguide-api` en el dispositivo del usuario (el bridge remoto bloquea
`rm`/`unlink` por defecto) porque `nest build` limpia `dist/` antes de
regenerarla. El usuario aprobó ese permiso para la carpeta del backend.
