import { apiDelete, apiGet, apiPatch } from "@/lib/api/client";
import type { PaginatedResult } from "@/types/api";
import type { FindUsersParams, User } from "../types/user.types";
import type { UpdateUserFormValues } from "../schemas/update-user.schema";

export function fetchUsers(params: FindUsersParams) {
  return apiGet<PaginatedResult<User>>("/users", { params });
}

export function fetchUser(id: string) {
  return apiGet<User>(`/users/${id}`);
}

export function updateUser(id: string, payload: UpdateUserFormValues) {
  return apiPatch<User>(`/users/${id}`, payload);
}

export function deactivateUser(id: string) {
  return apiDelete<null>(`/users/${id}`);
}
