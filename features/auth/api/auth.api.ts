import { apiGet, apiPatch, apiPost } from "@/lib/api/client";
import type { AuthResponse, AuthUser } from "../types/auth.types";
import type { LoginFormValues } from "../schemas/login.schema";
import type { ForgotPasswordFormValues } from "../schemas/forgot-password.schema";
import type { UpdateProfileFormValues } from "../schemas/update-profile.schema";

export interface RegisterPayload {
  name: string;
  lastName: string;
  email: string;
  password: string;
  avatarUrl?: string;
}

export interface ResetPasswordPayload {
  code: string;
  newPassword: string;
}

export function loginRequest(payload: LoginFormValues) {
  return apiPost<AuthResponse>("/auth/login", payload);
}

export function registerRequest(payload: RegisterPayload) {
  return apiPost<AuthResponse>("/auth/register", payload);
}

export function meRequest() {
  return apiGet<AuthUser>("/auth/me");
}

export function updateProfileRequest(payload: UpdateProfileFormValues) {
  return apiPatch<AuthUser>("/auth/me", payload);
}

export function forgotPasswordRequest(payload: ForgotPasswordFormValues) {
  return apiPost<null>("/auth/forgot-password", payload);
}

export function resetPasswordRequest(payload: ResetPasswordPayload) {
  return apiPost<null>("/auth/reset-password", payload);
}
