export type UserRole = "STUDENT" | "TEACHER";

export interface AuthUser {
  id: string;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}
