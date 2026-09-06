"use client";

import { GraduationCap } from "lucide-react";
import { UserListPage } from "@/features/users/components/user-list-page";

export default function TeacherStudentsPage() {
  return (
    <UserListPage
      role="STUDENT"
      icon={GraduationCap}
      showProgress
      tourStorageKey="teacher-students"
    />
  );
}
