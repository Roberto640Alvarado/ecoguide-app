export interface ChatbotConfig {
  id: string;
  protectedAreaId: string;
  providerId: string;
  model: string;
  systemPrompt: string;
  welcomeMessage: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}
