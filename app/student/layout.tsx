import { StudentSidebar } from "@/components/layout/student-sidebar";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentSidebar>{children}</StudentSidebar>;
}
