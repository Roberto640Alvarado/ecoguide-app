# Tour guiado: solo manual, sin auto-inicio

## Contexto

El usuario reportó que al entrar a las secciones de docente (Usuarios, AI
Providers, Áreas protegidas) el tour guiado se disparaba solo, sin haber
dado clic en "Ver tour guiado". Esto era el comportamiento de auto-inicio
de `usePageTour` (`hooks/use-page-tour.ts`): por diseño anterior, el tour
se reproducía automáticamente la primera vez que el navegador visitaba
cada página (gateado por una key en `localStorage`), y solo después de esa
primera vez quedaba puramente manual.

## Cambio

- `hooks/use-page-tour.ts`: el parámetro `autoStart` cambia su valor por
  defecto de `true` a `false`. Ninguna de las 3 páginas que consumen el
  hook (`app/teacher/protected-areas/page.tsx`,
  `app/teacher/ai-providers/page.tsx`,
  `features/users/components/user-list-page.tsx`) pasaba `autoStart`
  explícitamente, así que las tres quedan ahora 100% manuales: el tour
  solo se lanza al hacer clic en el botón "Ver tour guiado" del
  `PageTourBanner`.
- Se mantiene toda la maquinaria de auto-inicio (helpers `readTourSeen`/
  `markTourSeen`, el `useEffect` con el gate de `localStorage`) por si en
  el futuro se quiere reactivar el auto-play en alguna página puntual
  pasando `autoStart: true` — no se eliminó código, solo se invirtió el
  default.
- Comentarios de la interfaz `UsePageTourOptions` y del encabezado del
  archivo actualizados para reflejar el nuevo comportamiento por defecto.

## Verificación

- `npm run lint`: 0 errores, los mismos 5 warnings preexistentes de
  `react-hooks/incompatible-library` (no relacionados a este cambio).
- `npm run build`: build exitoso, las 20 rutas se generan sin errores de
  TypeScript.
