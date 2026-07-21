# Rediseño de la vista de estudiante: mapa, detalle y recorrido

## Objetivo

Rediseñar la experiencia de estudiante para explorar áreas protegidas:
un mapa "estático" tipo ilustración con las áreas etiquetadas, tarjetas
responsive (grilla en desktop, carrusel deslizable en móvil), una vista de
detalle con carrusel de imágenes y buena animación, y un botón "Empezar
recorrido" hacia una línea de tiempo con las etapas del recorrido educativo.

## Cambios realizados

- **`ProtectedAreasMap`** (reescrito): el `MapContainer` ahora deshabilita
  todas las interacciones (`dragging`, `scrollWheelZoom`, `doubleClickZoom`,
  `touchZoom`, `boxZoom`, `keyboard`, `zoomControl`, `attributionControl`)
  para que se sienta como una ilustración fija en vez de un mapa
  explorable. Cada área tiene un marcador circular verde con ícono de hoja
  (`L.divIcon`, ya que Leaflet no renderiza componentes de React) y un
  `Tooltip` **permanente** (siempre visible, no solo al pasar el cursor)
  con el nombre del área. Un clic en el marcador o en la etiqueta navega
  directo al detalle — ya no hay popup intermedio. Se agregó CSS en
  `globals.css` (`.leaflet-tooltip.area-map-tooltip`) para que la etiqueta
  se vea como una píldora blanca consistente con el resto de la UI, en vez
  del globo oscuro por defecto de Leaflet.
- **`/student/protected-areas`** (reescrito): el mapa siempre recibe todas
  las áreas (para que los pines no desaparezcan mientras se escribe en el
  buscador); el buscador solo filtra la lista/carrusel de tarjetas de
  abajo. En móvil (`sm:hidden`) las tarjetas se muestran en una fila
  horizontal con `scroll-snap` (`overflow-x-auto snap-x snap-mandatory`);
  en pantallas ≥640px se muestra la grilla normal (`sm:grid`, oculta en
  móvil). Animaciones de entrada con Framer Motion (stagger por índice).
- **`ProtectedAreaImageCarousel`** (nuevo, en `features/protected-areas`):
  carrusel de imágenes con `embla-carousel-react` (drag/swipe físico) +
  controles prev/next (siempre visibles en móvil, solo al hover en
  desktop) + indicadores de posición animados con Framer Motion (el punto
  activo se agranda). Si el área no tiene imágenes, muestra un estado
  vacío con ícono.
- **`/student/protected-areas/[id]`** (reescrito): usa el carrusel nuevo
  como portada, animaciones de entrada escalonadas para título/ubicación/
  descripción, y una sección final con degradado (`bg-gradient-to-br
  from-accent-soft to-surface`) y botón "Empezar recorrido" que navega a
  `/student/protected-areas/[id]/tour`.
- **`/student/protected-areas/[id]/tour`** (nuevo): línea de tiempo
  vertical con las 5 etapas del recorrido (FlashCards → Speaking practice
  → Chatbot → Test → Nota), cada una con ícono, línea conectora animada
  (crece con `scaleY`) y tarjeta de descripción. Como `StudentProgress`,
  `SpeakingPractices`, `Chatbot` y `Tests` aún no tienen API construida
  (siguen en "Pendientes en la API" en el CLAUDE.md de este repo), esta
  vista es una **vista previa visual**: todas las etapas se muestran como
  "Próximamente", con una nota explicándolo. No hay lógica de progreso
  real todavía — se conectará cuando exista el backend correspondiente.

## Razones del cambio

- El usuario pidió explícitamente un mapa "más estático" con los nombres
  de las áreas visibles (como una ilustración con pines etiquetados) en
  vez de un mapa libremente explorable — de ahí deshabilitar todas las
  interacciones de Leaflet y usar tooltips permanentes en vez de popups.
- Mobile: pidió una sección deslizable para ver las áreas — se implementó
  con `overflow-x-auto` + `scroll-snap` en vez de reusar la grilla (que no
  es cómoda de usar con el dedo en pantallas angostas).
- El recorrido (FlashCards → Speaking → Chatbot → Test → Nota) se construye
  como cascarón visual porque el propio usuario indicó que "cómo
  manejaremos las flash card" se resolverá en un paso posterior — no tenía
  sentido enlazar a una vista de flashcards para estudiante que todavía no
  existe.

## Resultado final

La vista de estudiante para áreas protegidas ahora tiene: mapa ilustrado
con nombres visibles y buscador, tarjetas responsive (grilla/carrusel),
detalle con carrusel de imágenes animado, y un recorrido de vista previa
con las 5 etapas planeadas. Todo con Framer Motion para las transiciones
de entrada.

## Pendiente

- Conectar las etapas del recorrido a datos reales de progreso cuando
  exista `StudentProgress` en la API, y decidir cómo se integra la
  experiencia de FlashCards del estudiante (tema explícitamente diferido
  por el usuario para la siguiente sesión).
- Carpeta `public/avatars` con los gestos del mascota EcoGuide sigue
  bloqueada: las imágenes pegadas en el chat no llegan como archivo al
  entorno de este agente.
- Verificación `tsc`/`eslint`: no se pudo completar en este entorno por
  límites de tiempo (mismo problema documentado en sesiones anteriores);
  se revisó todo manualmente, incluyendo los tipos de HeroUI (`Button
  size="lg"` confirmado válido) y los nombres de íconos de lucide-react
  (confirmados con `node -e` contra el paquete real). Recomendado correr
  `npx tsc --noEmit` localmente antes de dar por cerrado.
