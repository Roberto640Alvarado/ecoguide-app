"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../api/users.api";
import type { FindUsersParams } from "../types/user.types";

export function useUsers(params: FindUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => fetchUsers(params),
    placeholderData: keepPreviousData,
  });
}
