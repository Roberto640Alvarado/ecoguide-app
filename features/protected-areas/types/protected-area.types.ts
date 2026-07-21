export interface ProtectedArea {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  images: string[];
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface FindProtectedAreasParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  isPublished?: boolean;
}
