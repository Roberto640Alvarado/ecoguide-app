export interface SpeakingResult {
  id: string;
  protectedAreaId: string;
  speakingPracticeId: string;
  audioUrl: string;
  transcription: string;
  feedback: string;
  score: number;
  createdAt: string;
}

export interface CreateSpeakingResultPayload {
  protectedAreaId: string;
  audioUrl: string;
  transcription: string;
}

export interface FindSpeakingResultsParams {
  page?: number;
  limit?: number;
  sort?: string;
}
