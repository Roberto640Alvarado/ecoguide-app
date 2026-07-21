# Corrección de inputs y rediseño de Login/Register

## Objetivo

El usuario reportó que los inputs del formulario de registro se veían inconsistentes: el campo
enfocado ("First name") mostraba un anillo verde grueso mientras que el siguiente ("Last name")
se veía apagado/deshabilitado. Se pidió corregir los inputs de Login y Register, y mejorar el
diseño general con libertad creativa, manteniéndolo responsive.

## Diagnóstico

No era un bug introducido por la app, sino un comportamiento por defecto de HeroUI v3 combinado
con el token de marca del proyecto:

- HeroUI define `--field-border: transparent` por defecto (los campos no llevan borde en reposo,
  solo una sombra muy sutil), por lo que un input vacío se ve "lavado" frente a cualquier campo
  con estado visual (foco, hover).
- El anillo de foco (`ring-2 ring-focus`) usa el token `--focus: var(--accent)`, y `globals.css`
  ya sobrescribe `--accent` con el verde de marca de EcoGuide — de ahí el anillo verde grueso en
  el campo enfocado, que por contraste hacía ver "roto" al resto.

## Cambios realizados

- `app/globals.css`: se agregó `--field-border: var(--border)` (tema claro y oscuro) para que
  todos los campos de formulario tengan un borde visible y consistente en reposo, en toda la web
  (no solo Login/Register), reutilizando el mismo token de borde que ya usan las tarjetas.
- `app/(auth)/layout.tsx`: la tarjeta contenedora ahora es más ancha en `/register`
  (`max-w-xl` vs `max-w-md` en el resto) mediante `usePathname`, ya que el formulario de registro
  es más denso (avatar + grid de 2 columnas + checklist de contraseña). Se pulió la sombra
  (`shadow-xl`) y se agregó un leve `backdrop-blur` a la tarjeta.
- `features/auth/components/avatar-picker.tsx`: se convirtió el botón en `motion.button` con
  `whileHover`/`whileTap`, se agregó un anillo (`ring-accent`) alrededor del avatar seleccionado
  y un fondo secundario en hover, para mejor feedback visual e interactivo.
- `app/(auth)/register/page.tsx`: se agregaron micro-encabezados de sección ("Datos personales" /
  "Seguridad") aprovechando el nuevo ancho de la tarjeta, y se ajustó el espaciado del formulario
  (`gap-5`).
- `app/(auth)/login/page.tsx`: se alineó el espaciado del formulario (`gap-5`) con el resto de
  vistas de auth para mantener consistencia visual.

## Razones del cambio

- Corregir el token de borde en `globals.css` resuelve el problema de raíz de forma global y
  reutilizable (principio DRY del proyecto), en vez de parchear estilos campo por campo.
- Ensanchar la tarjeta solo en `/register` evita que el login (dos campos) se vea artificialmente
  ancho, mientras el registro (más denso) gana aire.
- Las animaciones del `AvatarPicker` y los encabezados de sección mejoran la jerarquía visual sin
  agregar dependencias nuevas ni romper la validación existente.

## Resultado final

- `npx tsc --noEmit` y `npx eslint app components store lib features middleware.ts` sin errores
  ni warnings.
- Los inputs de Login y Register ahora tienen un borde visible consistente en reposo, hover y
  foco, en toda la aplicación (dashboards de estudiante/docente incluidos, al compartir los
  mismos componentes `TextField`/`Input`).
