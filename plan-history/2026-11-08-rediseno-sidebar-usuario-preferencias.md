# Preferencias en el encabezado y menú de usuario en el sidebar

## Objetivo

Sacar el idioma y el tema del pie del sidebar y ponerlos arriba a la
derecha con controles más claros, y mejorar el bloque de información del
usuario y el cierre de sesión. Responsive.

## Cambios realizados

- `components/ui/sky-toggle.tsx` + `sky-toggle.module.css`: interruptor
  ilustrado día/noche (sol con nubes ↔ luna con estrellas). Se portó el
  componente de styled-components a CSS Module para no agregar esa
  dependencia ni su registro de SSR. Ahora es controlado, usa un checkbox
  nativo con `role="switch"` oculto solo visualmente (accesible con
  teclado, con foco visible) y respeta `prefers-reduced-motion`.
- `components/layout/theme-switch.tsx`: SkyToggle conectado a next-themes.
- `components/layout/language-switch.tsx`: control segmentado ES | EN con
  indicador animado; se ven ambas opciones y la activa queda marcada.
- `components/layout/user-menu.tsx`: tarjeta del usuario (avatar, nombre,
  rol como insignia) que abre un menú con nombre, correo y rol, accesos a
  "Mi perfil" y "Panel principal", y "Cerrar sesión" separado, en rojo y con
  spinner mientras cierra. Con el sidebar colapsado queda solo el avatar.
- `dashboard-shell.tsx`: idioma y tema arriba a la derecha del encabezado
  (en todos los tamaños); el pie del sidebar queda con "Instalar app" y el
  menú de usuario.

## Razones del cambio

- El botón de idioma mostraba el idioma al que se cambiaba, no el actual.
- Las preferencias y el logout competían con la información del usuario
  en el pie del sidebar.

## Resultado final

Probado en escritorio (1280px) y móvil (375px, sin scroll horizontal), en
modo claro y oscuro: el tema y el idioma cambian desde el encabezado y el
menú de usuario abre hacia arriba con su información y el cierre de sesión.
