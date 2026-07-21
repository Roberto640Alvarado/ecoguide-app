export interface AIModel {
  id: string;
  name: string;
  model: string;
  isActive: boolean;
}

export interface AIProvider {
  id: string;
  providerName: string;
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
