"use client";

import { UserCog } from "lucide-react";
import { UserListPage } from "@/features/users/components/user-list-page";

export default function TeacherTeachersPage() {
  return (
    <UserListPage
      role="TEACHER"
      icon={UserCog}
      showProgress={false}
      tourStorageKey="teacher-teachers"
    />
  );
}
