# Avatar de registro + rediseño Login/Register + validación de contraseña en tiempo real

## Objetivo

Agregar un selector de avatar (niño / niña) en el formulario de registro, persistir esa elección
en el usuario y mostrarla en toda la web (navbar, sidebars, dashboards). Además, mejorar el diseño
visual de las vistas de Login y Register, y agregar retroalimentación en tiempo real de los
requisitos de contraseña mientras el usuario escribe (en Register y en Reset Password).

## Cambios realizados

### Backend (ecoguide-api)

- `src/auth/dto/register.dto.ts`: se agregó la constante `AVATAR_OPTIONS` (whitelist de rutas
  estáticas: `/avatars/avatar-boy.png`, `/avatars/avatar-girl.png`) y el campo opcional
  `avatarUrl` en `RegisterDto`, validado con `@IsIn(AVATAR_OPTIONS)` para no aceptar URLs
  arbitrarias.
- `src/users/types/create-user.type.ts`: se agregó `avatarUrl?: string` a `CreateUserData`.
- `src/auth/services/auth.service.ts`: `register()` ahora reenvía `avatarUrl` hacia
  `usersService.create(...)`. No fue necesario tocar `UsersRepository` porque ya hace spread
  directo de `data` en `prisma.user.create({ data })`, y el campo `avatarUrl` en el schema de
  Prisma (`User.avatarUrl String?`) ya existía sin usarse.

### Frontend (ecoguide-app)

- `public/avatars/avatar-boy.png` y `public/avatars/avatar-girl.png`: ilustraciones nuevas
  (256×256) generadas a partir de SVG propios.
- `lib/constants/avatars.ts`: catálogo de avatares disponibles (id, ruta, etiqueta EN/ES),
  sincronizado manualmente con el whitelist del backend.
- `features/auth/schemas/register.schema.ts`: se agregó `avatarUrl` como campo requerido.
- `features/auth/api/auth.api.ts` y `features/auth/hooks/use-register.ts`: `avatarUrl` viaja en
  el payload de registro.
- `features/auth/components/avatar-picker.tsx` (nuevo): selector visual de dos tarjetas
  (niño/niña) controlado, integrado vía `Controller` de React Hook Form.
- `components/ui/user-avatar.tsx` (nuevo): componente reutilizable que muestra la imagen del
  avatar o, si no hay una, un círculo con la inicial del nombre como respaldo.
- Avatar mostrado en: `PublicNavbar` (saludo del usuario autenticado), `DashboardShell`
  (bloque de usuario en ambos sidebars) y en los headers de bienvenida de
  `student/dashboard` y `teacher/dashboard`.
- `features/auth/components/password-requirements.tsx` (nuevo): checklist en vivo con 3 reglas
  (mínimo 8 caracteres, al menos una letra, al menos un número), con íconos animados de
  check/equis y texto bilingüe.
- `features/auth/components/password-field.tsx` (nuevo): input de contraseña reutilizable con
  ícono de candado, botón de mostrar/ocultar (ojo), y checklist opcional (`showRequirements`).
- Rediseño de `app/(auth)/login/page.tsx`: encabezado con ícono en badge circular, campo de
  email con ícono, contraseña usando `PasswordField` (sin checklist, por ser login).
- Rediseño de `app/(auth)/register/page.tsx`: encabezado con ícono, `AvatarPicker` al inicio del
  formulario, campos de nombre/apellido/email con íconos, `PasswordField` con checklist en la
  contraseña nueva.
- `app/(auth)/reset-password/page.tsx`: los campos de nueva contraseña y confirmación ahora usan
  `PasswordField` (checklist solo en la nueva contraseña).

## Razones del cambio

- El avatar mejora la identidad visual del usuario dentro de la plataforma educativa, orientada a
  estudiantes jóvenes, sin necesitar un flujo de subida de imágenes todavía (se optó por un
  whitelist de assets estáticos, validado en el DTO, dejando la puerta abierta a un futuro flujo
  real de carga vía R2 sin romper el contrato del endpoint).
- El checklist de contraseña en tiempo real reduce fricción y errores 400 al registrar o
  restablecer contraseña, mostrando de forma proactiva las mismas reglas que ya exige el backend.
- El rediseño de Login/Register busca consistencia visual con el resto del panel (íconos,
  espaciado, badges) y mejor usabilidad (mostrar/ocultar contraseña).

## Resultado final

- `npx tsc --noEmit` limpio en ambos proyectos (los únicos errores vistos en `ecoguide-app`
  pertenecían a tipos autogenerados dentro de `.next/dev/types`, bloqueados por un proceso de
  desarrollo en ejecución y no relacionados con el código fuente; al filtrarlos, no queda ningún
  error real).
- `npx eslint` sin errores ni warnings en ambos proyectos.
- Flujo de registro ahora persiste y expone el avatar elegido; se refleja de inmediato en navbar,
  sidebars y dashboards de ambos roles.
