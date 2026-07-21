# Landing page, navbar público y autenticación funcional (Login/Registro)

**Fecha:** 2026-07-18

## Objetivo

Crear la landing page de EcoGuide Training (punto de entrada del sitio) con navbar
público, toggle de idioma EN/ES y footer básico. En una segunda iteración: integrar
el logo real y el avatar del guía "Eco", pulir animaciones, y construir un flujo de
autenticación completo (Login y Registro) conectado a `ecoguide-api`.

## Cambios realizados

### Landing page
- `app/globals.css`: configuración correcta de HeroUI v3 (`@import "@heroui/styles"`,
  sin plugin ni Provider) con acento eco-verde personalizado (`--accent`).
- `app/providers.tsx`: `ThemeProvider` (next-themes) + `QueryClientProvider`
  (TanStack Query) + hidratación de sesión al cargar la app.
- `app/layout.tsx`: fuente Open Sans, metadata de EcoGuide.
- `store/language-store.ts`: Zustand + persist para el toggle EN/ES.
- `lib/i18n/landing-content.ts` y `lib/i18n/auth-content.ts`: diccionarios de
  contenido bilingüe (copy exacto en inglés provisto por el usuario + traducción
  al español).
- `components/layout/public-navbar.tsx`: navbar público con logo real
  (`/logo.png`), toggle de idioma, y estado consciente de sesión (Login/Registro
  si no hay sesión, nombre + logout si la hay).
- `components/layout/public-footer.tsx`: footer básico con logo real.
- `components/landing/hero-section.tsx`, `features-section.tsx`,
  `guide-preview-section.tsx`: secciones animadas con Framer Motion. La última
  usa `/eco-avatar.png` con burbujas de chat animadas (indicador de "escribiendo"
  seguido del mensaje) para simular al guía "Eco" hablando.

### Autenticación funcional (Login / Registro)
- `ecoguide-api/src/main.ts`: se habilitó CORS (`app.enableCors`) — necesario para
  que el frontend pueda llamar a la API desde otro origen/puerto.
- `types/api.ts`: tipos compartidos del envelope de la API y `PaginatedResult<T>`.
- `lib/api/client.ts`: instancia de axios con interceptor de `Authorization`
  (Bearer token desde el store en memoria) y desenvoltura automática del
  envelope `{status, message, data}`.
- `store/auth-store.ts`: estado de sesión en memoria (nunca persistido en
  localStorage), con `accessToken` y `user`.
- `app/api/auth/session/route.ts`: route handler propio que guarda el JWT en una
  cookie httpOnly (POST), la lee para rehidratar el store en memoria al cargar
  la app (GET, ya que JS no puede leer una cookie httpOnly), y la limpia en
  logout (DELETE).
- `features/auth/`: `schemas` (Zod, espejo exacto de `LoginDto`/`RegisterDto` de
  la API, mismos mensajes en español), `types`, `api` (llamadas a
  `/auth/login`, `/auth/register`, `/auth/me`) y `hooks`
  (`useLogin`, `useRegister`, `useLogout`, `useSessionHydration`).
- `middleware.ts`: redirige a los usuarios ya autenticados fuera de
  `/login` y `/register`. Queda documentado el punto de extensión para proteger
  `(student)`/`(teacher)` cuando esas rutas existan.
- `app/(auth)/layout.tsx`: layout compartido con logo (vuelve al inicio al hacer
  clic), enlace "Volver al inicio", toggle de idioma y fondo animado.
- `app/(auth)/login/page.tsx` y `app/(auth)/register/page.tsx`: formularios con
  React Hook Form + Zod + componentes `Form`/`TextField`/`Input` de HeroUI v3,
  validación en tiempo real y manejo de errores de la API.
- `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:3000`.

## Razones del cambio

- El usuario pidió explícitamente una landing con navbar público, toggle de
  idioma y footer, y luego el flujo real de Login/Registro conectado a la API
  ya existente (decisión confirmada: "Funcional completo").
- El JWT se guarda en cookie httpOnly (protege contra robo vía XSS) pero
  `ecoguide-api` solo acepta el token vía header `Authorization: Bearer` (no
  cookies) — de ahí el patrón híbrido: cookie httpOnly como fuente de verdad
  entre recargas + store en memoria (nunca localStorage) para el interceptor
  de axios durante la sesión activa.
- CORS no estaba habilitado en el backend; sin él, ninguna llamada del
  frontend (en otro puerto) habría funcionado.

## Resultado final

- `tsc --noEmit` y `eslint` limpios en `ecoguide-app` y `ecoguide-api`.
- Landing, navbar, footer, login y registro funcionando de principio a fin
  contra la API real (login/registro emiten JWT, se guarda la sesión, se
  redirige al inicio).
- Nota para el usuario: tanto `ecoguide-api` como `ecoguide-app` corren en el
  puerto 3000 por defecto — al levantar ambos en local, iniciar el frontend en
  otro puerto (por ejemplo `next dev -p 3001`).
