export type SpeakingTurnRole = "assistant" | "user";

export interface SpeakingTurn {
  id: string;
  role: SpeakingTurnRole;
  message: string;
  createdAt: string;
}

/**
 * Una llamada de práctica de speaking (multi-turno, ver
 * ChatbotConversation — mismo patrón). `feedback`/`score` solo se llenan al
 * finalizar (`endedAt` deja de ser null); antes de eso viajan como null. Ya
 * no existe `audioUrl`/`transcription`: el audio de cada turno se transcribe
 * en el backend (Groq/Whisper) y se descarta, solo el texto queda guardado.
 */
export interface SpeakingResult {
  id: string;
  protectedAreaId: string;
  speakingPracticeId: string;
  turns: SpeakingTurn[];
  startedAt: string;
  endedAt: string | null;
  feedback: string | null;
  score: number | null;
}

export interface FindSpeakingResultsParams {
  page?: number;
  limit?: number;
  sort?: string;
}
