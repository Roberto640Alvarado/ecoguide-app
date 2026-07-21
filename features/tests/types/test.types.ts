export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  score: number;
}

export interface Test {
  id: string;
  protectedAreaId: string;
  title: string;
  description: string;
  maxAttempts: number;
  passingScore: number;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
}
