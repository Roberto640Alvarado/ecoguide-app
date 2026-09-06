# Landing page: consistencia de fondo entre secciones, tema claro/oscuro y animaciones que se repiten

## Objetivo

El usuario mandó capturas de la landing ya rediseñada (ver
`2026-09-06-rediseno-landing-page-animaciones.md`) con feedback puntual:

1. Mejor diseño, funcionando bien en tema claro y oscuro.
2. No hacer cambios fuertes de tonalidad entre secciones — había una
   sección ("Elige tu camino") con fondo negro sólido de pared a pared
   entre secciones claras, lo que se sentía como un bloque aparte en vez
   de parte de la misma página.
3. Las animaciones de "escritura" (typewriter) deben seguir pasando, no
   solo la primera vez que se entra/recarga la página.
4. Mencionar explícitamente en el contenido que existe chatbot, práctica
   conversacional, tests sobre los lugares y retroalimentación en tiempo
   real.
5. Agregar el selector de tema (claro/oscuro) también en la landing.
6. Más animaciones en general.

## Cambios realizados

`components/landing/typewriter-text.tsx`: el `useInView` pasó de
`once: true` a `once: false`, y el efecto ahora reinicia `charCount` a 0
cuando el elemento sale de vista (en silencio, mientras está fuera de
pantalla) para que la próxima vez que vuelva a entrar en el viewport
arranque limpio desde el principio. Antes la animación solo se disparaba
una vez por carga de página. El `setCharCount(0)` síncrono dentro del
efecto necesitó un `eslint-disable-next-line react-hooks/set-state-in-effect`
(mismo patrón ya usado en `theme-toggle.tsx` para su guard de `mounted`:
es intencional, no un efecto derivado de props/state).

`components/layout/public-navbar.tsx`: se agregó `<ThemeToggle>`
(componente ya existente, reutilizado tal cual del sidebar de
docente/estudiante — sobre `next-themes`) junto al botón de idioma.

`components/landing/choose-path-section.tsx`: la causa real del "cambio
fuerte de tonalidad" era que la sección envolvía TODO en un fondo negro
sólido (`bg-[#04120e]`) de pared a pared, distinto al fondo del resto de
la página (`bg-background`, heredado del `body`, que sí es theme-aware).
Se quitó ese fondo — la sección ahora es transparente y muestra el mismo
`bg-background` de siempre — y en su lugar se agregaron los mismos blobs
difuminados en `bg-accent-soft` que ya usa el Hero, para que se sienta
parte del mismo lenguaje visual en vez de un bloque aparte. Las dos
tarjetas ("Soy estudiante"/"Soy docente") se mantienen oscuras a
propósito en ambos temas — igual que en la referencia "Choose Your
Adventure" — pero ahora es un acento intencional sobre un fondo
consistente, no una sección que cambia de tonalidad. Se agregó también:
ícono con `whileHover={{rotate,scale}}`, y cada bullet entra con su
propio fade+slide escalonado (antes aparecían todos de golpe con la
tarjeta).

`components/landing/features-section.tsx` y `lib/i18n/landing-content.ts`:
se agregó una 4ª tarjeta ("Retroalimentación en tiempo real" /
"Real-Time Feedback") y se reescribió la primera para mencionar
explícitamente el chatbot ("Conversa con un guía virtual" /
"Chat With a Virtual Guide"). La grilla pasó de 3 a 4 columnas en
`lg`. La tarjeta de feedback en tiempo real tiene un anillo que pulsa
detrás del ícono (`animate={{scale,opacity}}` en loop) para reforzar la
idea de "en vivo".

`components/landing/guide-preview-section.tsx`: el punto verde de
"en línea" junto al avatar de Eco ahora tiene un anillo que hace ping
(`scale`/`opacity` en loop infinito), en vez de quedarse estático.

## Verificación

- `npm run lint`: 0 errores (se detectó y corrigió un error real del
  React Compiler — `setState` síncrono dentro de un efecto — con el mismo
  patrón de disable ya usado en el proyecto). Quedan las mismas 5
  advertencias preexistentes de `react-hooks/incompatible-library`.
- `npm run build`: compila, type-checkea y genera las 20 páginas sin
  errores.
