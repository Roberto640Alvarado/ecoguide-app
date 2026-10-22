import { isSameDay } from "date-fns";
import type { ChatMessage } from "../types/chatbot-conversation.types";

/**
 * Ventana máxima entre dos mensajes consecutivos del mismo autor para
 * agruparlos visualmente (estilo iMessage: burbujas pegadas, un solo avatar
 * y una sola hora al final del grupo).
 */
const GROUP_WINDOW_MS = 5 * 60 * 1000;

export interface ChatMessageItem {
  message: ChatMessage;
  /** Primer mensaje de un grupo: lleva más espacio arriba y el nombre del bot. */
  isFirstInGroup: boolean;
  /** Último mensaje de un grupo: lleva avatar, "cola" de la burbuja y la hora. */
  isLastInGroup: boolean;
  /** El mensaje abre un día nuevo: se muestra el separador de fecha arriba. */
  showDateSeparator: boolean;
}

function isSameGroup(previous: ChatMessage, current: ChatMessage): boolean {
  const previousDate = new Date(previous.createdAt);
  const currentDate = new Date(current.createdAt);

  return (
    previous.role === current.role &&
    isSameDay(previousDate, currentDate) &&
    currentDate.getTime() - previousDate.getTime() < GROUP_WINDOW_MS
  );
}

export function groupChatMessages(messages: ChatMessage[]): ChatMessageItem[] {
  return messages.map((message, index) => {
    const previous = messages[index - 1];
    const next = messages[index + 1];

    return {
      message,
      showDateSeparator:
        !previous ||
        !isSameDay(new Date(previous.createdAt), new Date(message.createdAt)),
      isFirstInGroup: !previous || !isSameGroup(previous, message),
      isLastInGroup: !next || !isSameGroup(message, next),
    };
  });
}
