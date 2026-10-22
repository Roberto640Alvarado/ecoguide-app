# Rediseño del chatbot del estudiante: conversación estilo mensajería, animaciones y responsive

## Objetivo

Rediseñar `/student/protected-areas/[id]/chatbot` para que se sienta como
una app de mensajería (estilo iMessage), con animaciones de envío y
recepción de mensajes, y que el chat ocupe todo el ancho y alto disponible
en cualquier tamaño de pantalla.

## Cambios realizados

- `features/chatbot-conversations/components/chat-window.tsx`: reescrito.
  Header con avatar, estado animado ("En línea" / "Escribiendo…" /
  "Conversación finalizada") y botón de historial en móvil. Mensaje del
  estudiante optimista (aparece al instante con "Enviando…"); al
  confirmarse, el mensaje real hereda la misma `key` para no re-montarse.
  Scroll automático al final (instantáneo al abrir, suave después). Pie
  con botón "Nuevo chat" cuando la conversación está finalizada.
- `chat-message-bubble.tsx`: burbujas agrupadas por autor (ventana de 5
  min): avatar, "cola" y hora solo en el último mensaje del grupo; nombre
  de EcoGuía solo en el primero. Entrada con resorte: el mensaje enviado
  sube desde el input, la respuesta brota desde el avatar. El historial
  entra con fade escalonado.
- `typing-indicator.tsx`: burbuja con puntos que laten en secuencia,
  entra/sale con resorte vía `AnimatePresence`.
- Nuevos: `chat-composer.tsx` (input tipo píldora que crece con el texto,
  botón de enviar circular animado), `chat-date-separator.tsx` ("Hoy ·
  20:40"), `finish-conversation-dialog.tsx` (AlertDialog de shadcn/ui),
  `utils/group-chat-messages.ts`, `utils/get-error-message.ts`.
- `conversation-list.tsx`: avatar con punto de estado, vista previa
  "Tú: …", resaltado del chat activo animado con `layoutId`, skeletons de
  carga.
- `app/student/protected-areas/[id]/chatbot/page.tsx`: grid
  `18rem | 1fr` en `lg+` con alto `100dvh` menos el encabezado; en
  móvil/tablet el historial vive en un `Sheet` lateral. Estado vacío con
  la mascota y accesos a nuevo chat / chats anteriores.

## Razones del cambio

La vista anterior tenía la ventana de chat sin `flex-1`, así que no
llenaba el ancho disponible, y un alto fijo de 36rem. Los mensajes del
estudiante solo aparecían cuando la IA respondía, lo que hacía sentir el
envío lento. Se aprovechó para migrar la vista a shadcn/ui.

## Resultado final

La vista ya no importa componentes de HeroUI salvo `toast` (igual que las
demás vistas migradas, hasta que exista un reemplazo de toasts en
shadcn/ui). Todas las animaciones respetan `prefers-reduced-motion`.

## Ajustes posteriores

- Al finalizar un chat: aviso de sistema centrado "Conversación finalizada
  · hora", tarjeta de retroalimentación y, en el pie, las acciones "Seguir
  practicando" (nuevo chat) y "Continuar con el recorrido"
  (`components/ui/session-complete-actions.tsx`, compartido con la llamada
  de speaking). En móvil los botones van apilados a todo el ancho.
