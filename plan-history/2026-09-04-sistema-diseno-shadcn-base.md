# Base compartida del sistema de diseño: shadcn/ui + paleta de marca + shell

**Fecha:** 2026-09-04

## Objetivo

Sentar la base compartida para migrar la UI de `ecoguide-app` de HeroUI a
shadcn/ui, con Framer Motion para animación y una paleta de marca nueva (Ink
Black, Steel Blue, Sea Green, Porcelain, Rosy Granite) en modo claro y
oscuro. Esto es el punto de partida documentado en `CLAUDE.md`, sección
"Sistema de Diseño"; la migración del resto de vistas sigue "vista por
vista" en próximas iteraciones — este cambio solo cubre el setup de
shadcn/ui, los tokens de color y el Navbar/Sidebar/Shell que comparten todas
las vistas.

## Cambios realizados

### Documentación
- `CLAUDE.md`: nueva sección "Sistema de Diseño" (principios, paleta,
  tokens semánticos light/dark, convención de componentes shadcn/ui,
  lineamientos de animación con Framer Motion, y el proceso de migración de
  HeroUI a shadcn vista por vista). Se actualizó también la lista de Tech
  Stack para reflejar que shadcn/ui reemplaza a HeroUI de forma progresiva.

### Setup de shadcn/ui
- `components.json`: config manual (style `new-york`, `cssVariables: true`,
  sin `tailwind.config` por ser Tailwind v4 CSS-first), aliases alineados a
  la estructura ya existente del proyecto.
- `lib/utils.ts`: helper `cn()` (clsx + tailwind-merge).
- `npx shadcn add` (modo add, no init, para no tocar la config a ciegas):
  `button`, `separator`, `tooltip`, `avatar`, `dropdown-menu`, `sheet`,
  `sidebar` — instala también `input`, `skeleton` y el hook `use-mobile`
  como dependencias transitivas. Dependencia nueva: `radix-ui` (paquete
  unificado que ya trae todos los primitivos que usan estos componentes).

### Paleta de marca y tokens (`app/globals.css`)
- Se sobreescriben los tokens base que ya definía HeroUI (`--background`,
  `--foreground`, `--surface(+foreground/secondary)`, `--overlay`,
  `--muted`, `--accent(+foreground)`, `--border`, `--separator`) con la
  paleta de marca, en `:root`/`[data-theme="light"]` y
  `.dark`/`[data-theme="dark"]` — HeroUI se mantiene instalado (vistas aún
  no migradas lo siguen usando) y ahora comparte la misma fuente de color
  que shadcn/ui.
- Se agregó `--info`/`--info-foreground` (Steel Blue) como acento
  informativo, separado del `--accent` primario (Sea Green).
- Se extendió el bloque `@theme inline` ya existente con los alias que
  faltaban para los componentes de shadcn (`card`, `popover`,
  `muted-foreground`, `destructive`, `input`, `ring`) y se retematizaron los
  tokens `--sidebar-*` que trae el componente `Sidebar` de shadcn (por
  defecto en gris zinc) para que apunten a los mismos tokens de marca en vez
  de tener una paleta paralela.
- Se agregó `@custom-variant dark (&:is(.dark *));` (lo agregó la propia CLI
  de shadcn) para que las utilidades `dark:` de Tailwind v4 respondan a la
  clase `.dark` que ya maneja `next-themes`.

### Shell compartido
- `components/layout/dashboard-shell.tsx`: reescrito sobre
  `SidebarProvider`/`Sidebar`/`SidebarHeader`/`SidebarContent`/
  `SidebarMenu*`/`SidebarFooter`/`SidebarTrigger`/`SidebarRail` de shadcn en
  vez del `useState` + plugin Preline `hs-overlay` que se usaba antes.
  Mismo contrato público (`navItems`, `roleLabel`, `dashboardHref`,
  `profileHref`) y mismas features: drawer en móvil, colapso a modo ícono en
  escritorio, resaltado de ruta activa, ítem "Pronto" (deshabilitado, con
  badge), footer con avatar/nombre/rol/idioma/logout. Se agregó un stagger
  sutil con Framer Motion en la lista de navegación (respeta
  `useReducedMotion`). `Button`/`Spinner` de HeroUI se reemplazaron por el
  `Button` de shadcn y un loader con `Loader2` de `lucide-react`.
- `components/layout/teacher-sidebar.tsx` / `student-sidebar.tsx`: sin
  cambios de código (mismo contrato de props).
- `components/layout/public-navbar.tsx`: `Button`/`buttonVariants` de
  `@heroui/react`/`@heroui/styles` reemplazados por los de
  `components/ui/button.tsx` (shadcn). Se conservó el `motion.header` de
  entrada existente.
- `components/layout/public-footer.tsx`: sin cambios de código (no usaba
  componentes de HeroUI); hereda la paleta nueva vía los tokens
  retematizados.

### Fixes en el código generado por la CLI de shadcn
- `hooks/use-mobile.ts` y `components/ui/sidebar.tsx` (`SidebarMenuSkeleton`)
  disparaban errores nuevos de `eslint` (reglas de pureza de React
  Compiler): `setState` síncrono dentro de un efecto, y `Math.random()`
  llamado durante el render dentro de un `useMemo`. Se corrigieron con el
  patrón recomendado (inicializador perezoso de `useState` en vez de
  `useMemo`/`setState` en el cuerpo del efecto), sin cambiar el
  comportamiento visual.

## Razones del cambio

- El usuario pidió explícitamente migrar a shadcn/ui + Radix, con Framer
  Motion para animaciones, diseño responsive, y la paleta de marca provista
  (Ink Black, Steel Blue, Sea Green, Porcelain, Rosy Granite) en modo claro
  y oscuro — reemplazando HeroUI por completo, pero de forma progresiva
  ("vista por vista"), empezando por la base compartida (setup + tokens +
  shell) antes de tocar el contenido de ninguna página específica.
- Se evitó `npx shadcn init` para no arriesgar una reescritura automática
  impredecible de `app/globals.css`, que ya tenía un setup afinado a mano
  (Preline, Leaflet, Tiptap). En su lugar se armó `components.json` y
  `lib/utils.ts` a mano, y solo se usó `npx shadcn add` (que solo agrega
  archivos nuevos bajo `components/ui/`).
- Se retematizaron los tokens que ya usaba HeroUI (en vez de definir una
  paleta paralela para shadcn) para que las vistas aún no migradas y las ya
  migradas compartan una única fuente de verdad de color durante toda la
  transición.
- El componente `Sidebar` de shadcn reemplaza al sidebar hecho a mano sobre
  Preline `hs-overlay` porque ya resuelve, de forma accesible y sin JS de
  terceros, exactamente el mismo comportamiento (drawer móvil + colapso a
  ícono en escritorio) que se había construido manualmente.

## Resultado final

- `npm run lint` y `npm run build` limpios en `ecoguide-app` (build generó
  todas las rutas sin errores, incluidas todas las de `/teacher/*` y
  `/student/*`).
- Verificación visual con `npm run dev`: landing (navbar + hero + features)
  correcta en modo claro y oscuro, en ancho móvil/tablet/escritorio; `/login`
  renderiza con los tokens nuevos; el middleware sigue redirigiendo
  correctamente a `/login` en rutas protegidas sin sesión.
- Pendiente para el usuario: verificar visualmente el `Sidebar` ya
  autenticado (`/teacher/dashboard`, `/student/dashboard`) con una cuenta
  real, ya que esta sesión no tenía credenciales de prueba.
- Advertencia preexistente, no relacionada con este cambio: Next.js marca la
  convención de archivo `middleware.ts` como deprecada a favor de `proxy.ts`
  (`ecoguide-app` sigue usando `middleware.ts`). No se tocó — queda para que
  el usuario decida si migrarlo.
- Fuera de alcance de este cambio (según lo acordado): contenido de páginas
  específicas, desinstalar `@heroui/*` (se hace cuando se migre la última
  vista), retonar `--danger`/`--warning`/`--success`, y el resto de usos de
  Preline fuera del sidebar.
