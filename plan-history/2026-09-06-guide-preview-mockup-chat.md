# GuidePreviewSection: mockup real de ventana de chat con ejemplo de conversación

## Objetivo

El usuario mandó una captura de "Eco · Your tour guide" en tema oscuro
señalando que se veía muy vacío (mucho espacio negro sin usar a la
derecha) y pidió mejor diseño, además de mostrar un ejemplo real del
chatbot que ofrece la plataforma. Antes de escribir el ejemplo se revisó
`features/chatbot/components/chatbot-config-form.tsx`
(`buildSystemPromptExample`) para confirmar el rol real del chatbot: es
un guía turístico virtual de un área protegida específica, que conversa
en inglés con el estudiante respondiendo solo sobre esa área (flora,
fauna, senderos, historia, conservación, consejos de visita), en
mensajes cortos tipo chat real — así el ejemplo agregado refleja el
producto real, no algo inventado sin relación.

## Cambios realizados

`lib/i18n/landing-content.ts`: `guide` ganó los campos `tagline`,
`userExample`, `answerExample`, `inputPlaceholder`, `badgeAvailable` y
`badgeFeedback` (en/es).

`components/landing/guide-preview-section.tsx`, reescrito:
- Layout de 2 columnas en desktop (`lg:grid-cols-[260px_1fr]`): a la
  izquierda la presentación de Eco (avatar, tagline, dos badges —
  "Disponible 24/7" e "Feedback al instante"); a la derecha, un mockup
  completo de ventana de chat (antes esa mitad quedaba vacía).
- El mockup de chat tiene: barra de encabezado (avatar chico + nombre +
  "En línea"), el hilo de mensajes, y una barra de input decorativa al
  fondo (placeholder + botón de enviar) — todo `aria-hidden` porque es
  ilustrativo, no funcional.
- El hilo de mensajes ahora tiene 4 turnos en vez de 2: saludo de Eco,
  pregunta de Eco, **una pregunta de ejemplo del estudiante**
  ("¡Cuéntame sobre el Parque El Imposible!") y **la respuesta de Eco**
  con info real de ese parque (flora/cascadas) siguiendo el mismo estilo
  corto y conversacional que exige el `systemPrompt` real del chatbot —
  esto es lo que muestra "el ejemplo del chatbot que ofrecemos".
- Nuevo componente `StudentBubble` (burbuja del estudiante, alineada a
  la derecha en `bg-accent`, sin efecto de escritura porque representa
  un mensaje ya enviado — solo entra con fade+slide) junto al ya
  existente `GuideBubble` (antes `ChatBubble`, renombrado por claridad,
  misma lógica de puntitos + `TypewriterText`).
- Se agregó un segundo blob difuminado (`bg-info/20`) en la esquina
  opuesta, para balancear el fondo ahora que la tarjeta es más ancha
  (`max-w-4xl` → `max-w-5xl`).

## Verificación

- `npm run lint`: 0 errores, mismas 5 advertencias preexistentes de
  `react-hooks/incompatible-library`.
- `npm run build`: compila, type-checkea y genera las 20 páginas sin
  errores.
