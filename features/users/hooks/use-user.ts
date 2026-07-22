"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../api/users.api";

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  });
}
