import { TeacherSidebar } from "@/components/layout/teacher-sidebar";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TeacherSidebar>{children}</TeacherSidebar>;
}
