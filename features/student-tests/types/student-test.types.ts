export interface StudentQuestion {
  id: string;
  question: string;
  options: string[];
  score: number;
}

/** Config del examen para RESOLVERLO — nunca incluye correctAnswer. */
export interface StudentTestConfig {
  id: string;
  protectedAreaId: string;
  title: string;
  description: string;
  maxAttempts: number;
  passingScore: number;
  attemptsUsed: number;
  attemptsRemaining: number;
  questions: StudentQuestion[];
}

export interface AnswerResult {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
}

export interface StudentTestResult {
  id: string;
  protectedAreaId: string;
  testId: string;
  attempt: number;
  score: number;
  passingScore: number;
  passed: boolean;
  answers: AnswerResult[];
  createdAt: string;
}
