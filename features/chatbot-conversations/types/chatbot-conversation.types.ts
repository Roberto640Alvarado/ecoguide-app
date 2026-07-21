export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  message: string;
  createdAt: string;
}

export interface ChatbotConversation {
  id: string;
  protectedAreaId: string;
  messages: ChatMessage[];
  startedAt: string;
  endedAt: string | null;
  feedback: string | null;
}

export interface FindConversationsParams {
  page?: number;
  limit?: number;
  sort?: string;
}
