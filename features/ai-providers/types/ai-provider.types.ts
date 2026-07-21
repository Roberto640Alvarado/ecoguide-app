export interface AIModel {
  id: string;
  name: string;
  model: string;
  isActive: boolean;
}

/** Espeja el enum AIProviderType de la API (ver ai-providers.service.ts). */
export const AI_PROVIDER_TYPES = [
  "GEMINI",
  "CLAUDE",
  "OPENAI",
  "MISTRAL",
  "DEEPSEEK",
] as const;

export type AIProviderType = (typeof AI_PROVIDER_TYPES)[number];

export const AI_PROVIDER_TYPE_LABELS: Record<AIProviderType, string> = {
  GEMINI: "Google Gemini",
  CLAUDE: "Anthropic Claude",
  OPENAI: "OpenAI",
  MISTRAL: "Mistral",
  DEEPSEEK: "DeepSeek",
};

export interface AIProvider {
  id: string;
  providerName: string;
  providerType: AIProviderType;
  isActive: boolean;
  models: AIModel[];
  createdAt: string;
}

export interface FindAIProvidersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  isActive?: boolean;
}
