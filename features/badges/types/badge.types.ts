export interface Badge {
  id: string;
  protectedAreaId: string;
  name: string;
  description: string;
  message: string;
  imageUrl: string;
  createdAt: string;
}

export interface FindBadgesParams {
  protectedAreaId: string;
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
}
