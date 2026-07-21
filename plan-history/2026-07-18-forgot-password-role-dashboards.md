# Recuperación de contraseña, paneles por rol y hardening de la sesión

**Fecha:** 2026-07-18

## Objetivo

Completar el flujo de autenticación con recuperación de contraseña (código de
6 dígitos), quitar el logo del layout de login/registro, redirigir a cada
usuario al panel correspondiente a su rol tras iniciar sesión, y construir un
ejemplo de panel (sidebar + dashboard) tanto para `STUDENT` como para
`TEACHER`. También se pidió auditar que el guardado de la sesión en cookies
sea seguro.

## Cambios realizados

- `app/(auth)/layout.tsx`: se quitó el logo del header (quedó solo el enlace
  "Volver al inicio" y el toggle de idioma), tal como se pidió para login y
  registro.
- `features/auth/schemas/forgot-password.schema.ts` y `reset-password.schema.ts`:
  espejo exacto de `ForgotPasswordDto` y `ResetPasswordDto` de la API (código
  de 6 dígitos, misma regex de contraseña).
- `features/auth/api/auth.api.ts` y hooks `use-forgot-password.ts` /
  `use-reset-password.ts`: llamadas a `POST /auth/forgot-password` y
  `POST /auth/reset-password`.
- `app/(auth)/forgot-password/page.tsx` y `app/(auth)/reset-password/page.tsx`:
  vistas nuevas. La segunda usa el componente `InputOTP` de HeroUI para el
  código de 6 dígitos. Se agregó el enlace "¿Olvidaste tu contraseña?" en
  login.
- **Corrección de arquitectura de rutas**: el `CLAUDE.md` original definía
  `(student)` y `(teacher)` como *route groups* con subrutas de mismo nombre
  (`protected-areas`, `flash-cards`). Como los route groups no agregan
  segmento a la URL, ambos habrían colisionado en la misma ruta real. Se
  corrigió usando carpetas literales `app/student/` y `app/teacher/`
  (documentado en el `CLAUDE.md` actualizado).
- `components/layout/dashboard-shell.tsx`: shell compartido (sidebar fijo en
  desktop, drawer animado en móvil, info de usuario + logout + toggle de
  idioma) reutilizado por `student-sidebar.tsx` y `teacher-sidebar.tsx` — dos
  componentes reales y distintos como se pidió, sin duplicar la lógica de
  layout (DRY).
- `app/student/{layout,dashboard/page}.tsx` y
  `app/teacher/{layout,dashboard/page}.tsx`: vista de ejemplo por rol con
  tarjetas de las próximas funcionalidades (marcadas "Próximamente" ya que
  esos módulos aún no existen en la API/UI).
- `features/auth/utils/get-dashboard-path.ts`: helper único que decide
  `/student/dashboard` o `/teacher/dashboard` según el rol — usado por
  `useLogin`, `useRegister`, `middleware.ts` y el navbar público.
- `useLogin`/`useRegister`: ahora redirigen al dashboard correspondiente al
  rol devuelto por la API en vez de siempre a `/`.
- `middleware.ts`: además de redirigir lejos de `/login`/`/register` cuando
  ya hay sesión, ahora protege `/student/*` y `/teacher/*` — sin sesión va a
  `/login`, con el rol equivocado va a su propio dashboard.
- `components/layout/public-navbar.tsx`: agrega un botón "Ir al panel" al
  dashboard correspondiente cuando hay sesión activa.
- `app/api/auth/session/route.ts`: se agregó una validación de forma del JWT
  (3 segmentos separados por punto) antes de guardarlo en la cookie.

## Auditoría de seguridad de la cookie/JWT

- La cookie (`ecoguide_token`) se guarda con `httpOnly: true` (JS del
  navegador nunca puede leerla, mitiga robo por XSS), `secure` en producción
  (solo se envía por HTTPS), `sameSite: "lax"` (mitiga CSRF sin romper
  navegación normal) y `maxAge` de 7 días, igual que `JWT_EXPIRATION="7d"` en
  el backend.
- El JWT nunca se guarda en `localStorage`/`sessionStorage`. El único lugar
  donde el token vive accesible a JS es el store de Zustand en memoria (sin
  `persist`), necesario porque `ecoguide-api` solo acepta el token vía header
  `Authorization: Bearer` (no cookies) — se pierde al cerrar la pestaña, lo
  cual es el comportamiento esperado.
- El middleware **no verifica la firma** del JWT (no tiene el secreto ni
  debería tenerlo) — solo decodifica el payload para decidir a dónde
  redirigir. Esto significa que alguien podría, en teoría, fabricar una
  cookie con un rol falso para ver la UI de un panel equivocado, pero eso no
  otorga acceso real a ningún dato: toda llamada real a la API pasa por el
  header `Authorization`, y `ecoguide-api` sí verifica la firma completa
  (rechaza con 401 cualquier token no firmado por el backend). La única
  superficie del middleware es de UX (a qué pantalla redirigir), no de
  autorización real.
- Se agregó una validación de forma (regex de 3 segmentos) en el route
  handler que guarda la cookie, para rechazar valores que ni siquiera tengan
  forma de JWT antes de persistirlos.

## Resultado final

- `tsc --noEmit` y `eslint` limpios sobre `app/`, `components/`, `features/`,
  `lib/`, `store/` y `middleware.ts`.
- Flujo completo: registro/login → redirección automática a
  `/student/dashboard` o `/teacher/dashboard` según el rol devuelto por la
  API → sidebar con info del usuario, logout y toggle de idioma → recuperación
  de contraseña con código de 6 dígitos operativa de principio a fin contra
  la API real.
- `CLAUDE.md` actualizado para reflejar la arquitectura de rutas real
  (`/student`, `/teacher` como carpetas literales) y corregir referencias a
  `@heroui/toast` (el componente correcto es `Toast` desde `@heroui/react`).
