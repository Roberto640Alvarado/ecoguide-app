export type UserRole = "STUDENT" | "TEACHER";

export interface User {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface FindUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  role?: UserRole;
}
