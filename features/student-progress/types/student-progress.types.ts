export interface FlashCardsProgress {
  available: boolean;
  completed: boolean;
}

export interface SpeakingProgress {
  available: boolean;
  attempts: number;
  bestScore: number | null;
}

export interface ChatbotProgress {
  available: boolean;
  conversations: number;
  finishedConversations: number;
}

export interface TestProgress {
  available: boolean;
  attemptsUsed: number;
  maxAttempts: number | null;
  bestScore: number | null;
  passingScore: number | null;
  passed: boolean;
}

/** Avance del estudiante en un área protegida. Ver StudentAreaProgressDoc (API). */
export interface StudentAreaProgress {
  protectedAreaId: string;
  areaName: string;
  areaImage: string | null;
  stepsCompleted: number;
  stepsTotal: number;
  progressPercent: number;
  flashCards: FlashCardsProgress;
  speaking: SpeakingProgress;
  chatbot: ChatbotProgress;
  test: TestProgress;
}

export interface FindStudentProgressParams {
  page?: number;
  limit?: number;
  search?: string;
}
