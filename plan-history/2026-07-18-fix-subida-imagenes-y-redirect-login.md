# Fix: subida de imágenes fallaba y "Editar" redirigía al login

## Objetivo

Corregir dos bugs reportados al probar la feature de imágenes de áreas protegidas:

1. Al subir una imagen en el formulario de crear/editar, el backend respondía 400 con
   "Debes adjuntar un archivo." aunque sí se había seleccionado un archivo.
2. Al presionar "Editar" en una card, la página cargaba y luego redirigía al login.

## Diagnóstico

### 1. Subida de imagen como JSON en vez de multipart

`lib/api/client.ts` crea la instancia de Axios con `headers: { "Content-Type": "application/json" }`
por defecto. El `transformRequest` interno de Axios (`axios/lib/defaults/index.js`) tiene esta
lógica para cualquier body de tipo `FormData`:

```js
if (isFormData) {
  return hasJSONContentType ? JSON.stringify(formDataToJSON(data)) : data;
}
```

Como el header ya venía fijado en `application/json`, Axios convertía el `FormData` (con el
archivo binario) a JSON antes de enviarlo — el `File` no se puede serializar como JSON, así que el
backend nunca recibía el campo `file` y el `FileInterceptor` de Nest fallaba con "Debes adjuntar
un archivo."

**Fix**: `uploadProtectedAreaImage` ahora pasa `headers: { "Content-Type": undefined }` en esa
request puntual, para que Axios detecte el `FormData` sin un `Content-Type` JSON ya fijado y deje
que el navegador arme el `multipart/form-data; boundary=...` correcto.

### 2. "Editar" redirige al login

`DashboardShell` (usado por los layouts de `/teacher` y `/student`) renderizaba `children`
inmediatamente, sin esperar a que `useSessionHydration()` (que corre en `app/providers.tsx`)
terminara de leer la cookie httpOnly y rehidratar el `accessToken` en el store de Zustand.

En una carga directa/dura de una ruta con fetch en el mount — como
`/teacher/protected-areas/[id]/edit`, que llama a `useProtectedArea(id)` apenas se monta — la
petición a la API podía salir **antes** de que el `accessToken` estuviera disponible, sin header
`Authorization`. El backend respondía 401, y el interceptor de Axios (`lib/api/client.ts`) limpia
la sesión y fuerza `window.location.href = "/login"` ante cualquier 401 — de ahí el "carga y me
redirige al inicio".

Este era un problema latente en **cualquier** página bajo `/teacher` o `/student` que dispara una
query al montar (por ejemplo también en `/teacher/ai-providers/[id]`), no exclusivo de
ProtectedAreas; solo se hizo evidente al probar esta vista nueva con una carga directa.

**Fix**: `DashboardShell` ahora lee `isHydrated` del store de auth y, mientras sea `false`, muestra
un spinner de página completa en vez de `children`. Así ninguna página hija dispara requests antes
de que el `accessToken` esté listo (o de que la hidratación confirme que no hay sesión, en cuyo
caso el propio `middleware.ts` ya se habría encargado de redirigir a `/login` antes de llegar aquí).

## Cambios realizados

- `features/protected-areas/api/protected-areas.api.ts`: `uploadProtectedAreaImage` anula el
  header `Content-Type` para dejar que Axios/el navegador fijen el boundary de multipart.
- `components/layout/dashboard-shell.tsx`: gate de `isHydrated` antes de renderizar `children`.

## Resultado final

- `npx tsc --noEmit` sin errores en `ecoguide-app`.
- La subida de imágenes en el formulario de áreas protegidas ahora envía multipart real y el
  backend recibe el archivo correctamente.
- Cualquier página protegida (`/teacher/*`, `/student/*`) con carga directa/dura ya no corre el
  riesgo de disparar requests sin sesión hidratada y ser expulsada al login.
