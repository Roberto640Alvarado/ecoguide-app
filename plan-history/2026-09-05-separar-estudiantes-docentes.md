# Separar Estudiantes y Docentes en módulos propios + rediseño de columnas

## Objetivo

En el rol Docente, separar la vista combinada "Estudiantes y docentes" en
dos módulos independientes del sidebar: "Estudiantes" y "Docentes". En la
tabla de Estudiantes:

1. Quitar la columna "Rol" (ya no aporta nada, cada módulo es de una sola
   audiencia).
2. La columna "Estado" muestra el switch de activar/desactivar directamente
   (en vez de solo una insignia de texto), y tiene su propio filtro
   (Activo/Inactivo) en el header.
3. La columna "Registrado" (fecha) tiene un filtro de rango de fechas en el
   header, con un calendario de shadcn/ui.
4. Mejor diseño para los botones de la columna de acciones (Progreso /
   Editar).

## Cambios realizados

- Nuevo `features/users/components/user-list-page.tsx`: componente
  compartido parametrizado por `role` ("STUDENT" | "TEACHER"), usado por
  ambos módulos para no duplicar la tabla completa. Controla el filtro de
  nombre, estado y rango de fechas vía `nuqs` (URL-shareable), arma las
  columnas de TanStack Table y el tour guiado (con un paso nuevo para el
  filtro de fecha).
- `app/teacher/users/page.tsx`: ahora solo renderiza
  `<UserListPage role="STUDENT" showProgress .../>` — el módulo
  "Estudiantes". Se mantiene esta ruta (no `students`) porque ya existe
  `app/teacher/users/[id]/progress`.
- Nuevo `app/teacher/teachers/page.tsx`: renderiza
  `<UserListPage role="TEACHER" showProgress={false} .../>` — el nuevo
  módulo "Docentes" (sin botón de Progreso, que solo aplica a estudiantes).
- `components/layout/teacher-sidebar.tsx`: se agrega el ítem "Docentes"
  (`/teacher/teachers`, ícono `UserCog`) junto al de "Estudiantes" (ahora
  con ícono `GraduationCap`).
- `app/teacher/dashboard/page.tsx`: se agrega una tarjeta de acceso rápido
  "Docentes" junto a la de "Estudiantes" (consistencia con el sidebar).
- `components/ui/column-filter.tsx`: nuevo `type="date-range"`, con un
  `Calendar` (shadcn/ui, `mode="range"`) dentro del popover en vez de un
  input o checkboxes. El valor se serializa como
  `"yyyy-MM-dd_yyyy-MM-dd"` (cualquiera de los dos lados puede ir vacío
  para un rango abierto) para mantenerse como un string plano compatible
  con `nuqs`/la URL, igual que los otros tipos de filtro.
- `components/ui/calendar.tsx`: instalado con
  `npx shadcn add calendar` (trae `react-day-picker` como dependencia
  nueva). El CLI generó el import de `cn` desde un paquete npm literal
  llamado `cn` en vez de `@/lib/utils` — se corrigió el import y se
  desinstaló ese paquete para no duplicar la utilidad de clases.
- `features/users/types/user.types.ts`: `FindUsersParams` gana
  `isActive?`, `createdFrom?` y `createdTo?` (formato `yyyy-MM-dd`) para
  poder filtrar por estado y por rango de fecha de registro.
- Los botones de la columna "Acciones" (Progreso/Editar) pasan a
  `rounded-full`, con el ícono de "Progreso" en `text-primary` para
  distinguirlo visualmente del de "Editar".

## Nota importante — depende del backend

Los filtros de `isActive`/`createdFrom`/`createdTo` se envían como query
params a `GET /users`, pero **no se verificó que `ecoguide-api` los
soporte** (ese backend vive en otro repo, no accesible desde esta sesión).
Si el backend todavía no filtra por esos parámetros, el filtro de fecha (y
posiblemente el de estado, aunque ese ya se usaba antes en Proveedores de
IA) no tendrá efecto aunque la UI se vea y se sienta correcta. Falta
confirmar esto con capturas/pruebas reales del usuario.

## Resultado final

`npm run lint` y `npm run build` pasan sin errores nuevos (mismos 5
warnings preexistentes de `react-hooks/incompatible-library`, no
relacionados). Pendiente de revisión visual del usuario.
