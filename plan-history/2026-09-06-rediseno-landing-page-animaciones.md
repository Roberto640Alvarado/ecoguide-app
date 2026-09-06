# Rediseño de la landing page: animaciones, hover interactivo y "orbit" flotante

## Objetivo

El usuario pasó 5 capturas de referencia (SaaS de seguros, HackerRank) y
pidió mejorar la landing page pública de EcoGuide manteniendo la paleta de
marca, aprovechando framer-motion (ya instalado) para buenas animaciones,
diseños interactivos con transiciones, hover con movimiento, elementos que
siguen al cursor o reaccionan al pasar el puntero, y animaciones de
escritura ("typewriter"). No se pidió un clon 1:1 de las referencias —
son de un dominio distinto (seguros / reclutamiento tech) — sino aplicar
el mismo lenguaje de interacción al contenido real de EcoGuide (guía
turístico, áreas protegidas, práctica de speaking).

## Componentes nuevos

`components/landing/typewriter-text.tsx`: componente reutilizable que
revela un texto letra por letra cuando entra en el viewport
(`useInView` de framer-motion, `once: true`), con cursor parpadeante
mientras escribe. El texto completo permanece accesible para lectores de
pantalla vía un `span` `sr-only` (el span visible, parcial, se marca
`aria-hidden`). Se usa en el título del hero y en las burbujas de chat de
`GuidePreviewSection`.

`components/landing/magnetic-wrapper.tsx`: envuelve un botón/CTA y lo
desplaza levemente hacia el cursor cuando pasa cerca ("magnético"), con
un spring de framer-motion para el regreso a su posición original. Se usa
en el CTA del hero y en los CTA de `ChoosePathSection`.

`components/landing/choose-path-section.tsx` (nueva sección, inspirada en
el patrón "Choose Your Adventure" de la referencia de HackerRank): dos
tarjetas oscuras lado a lado, "Soy estudiante" / "Soy docente", cada una
con ícono, descripción, 3 bullets con check y un CTA. Cada tarjeta se
inclina levemente en 3D hacia el cursor (`rotateX`/`rotateY` con spring) y
tiene un resplandor de color que sigue al puntero. El CTA de estudiante
va a `/register` (auto-registro); el de docente va a `/login`, porque las
cuentas de docente las crea un administrador (no hay auto-registro con
rol docente en `register.schema.ts`).

## Componentes modificados

`components/landing/hero-section.tsx`:
- Spotlight que sigue al cursor dentro de toda la sección (radial-gradient
  posicionado con `useMotionTemplate`/`useMotionValue` sobre las
  coordenadas del mouse).
- Dos anillos punteados concéntricos ("orbit"), uno en `--accent` y otro
  en `--info`, con rotación infinita lenta en sentidos opuestos —
  eco del patrón de líneas guía punteadas de la referencia de seguros.
- 4 chips flotantes (solo desktop, `lg:block`) con los íconos de las
  funciones principales (chat, áreas protegidas, speaking, insignias),
  cada uno con su propio flotado infinito más un parallax sutil que
  reacciona a la posición del cursor (profundidad distinta por chip).
- Título (`h1`) ahora usa `TypewriterText` en vez de aparecer de golpe.
- CTA envuelto en `MagneticWrapper`.

`components/landing/features-section.tsx`: cada tarjeta ahora tiene un
spotlight que sigue al cursor (radial-gradient con la posición del mouse
relativa a la tarjeta, visible solo en hover), además del levantamiento
(`whileHover={{y:-6}}`) y el ícono que ahora también rota levemente al
hacer hover, no solo escala.

`components/landing/guide-preview-section.tsx`: el `ChatBubble` mantenía
los 3 puntitos de "escribiendo..." como anticipación (se conservan), pero
ahora, en vez de revelar el texto completo de golpe al terminar la
espera, lo escribe letra por letra con `TypewriterText` — la animación de
escritura real que pidió el usuario.

`lib/i18n/landing-content.ts`: se agregó la sección `choosePath` (nueva
interfaz `LandingPathContent`) con copy en inglés y español para las dos
tarjetas de `ChoosePathSection`. El resto del contenido no cambió.

`app/page.tsx`: se inserta `<ChoosePathSection />` entre `FeaturesSection`
y `GuidePreviewSection`.

## Verificación

- `npm run lint`: 0 errores. (Se detectó y corrigió un error real del
  React Compiler en `typewriter-text.tsx` — mutar `ref.current` durante el
  render no está permitido; se movió a un `useEffect`.) Quedan las mismas
  5 advertencias preexistentes de `react-hooks/incompatible-library`, sin
  cambios.
- `npm run build`: compila, type-checkea y genera las 20 páginas sin
  errores.
