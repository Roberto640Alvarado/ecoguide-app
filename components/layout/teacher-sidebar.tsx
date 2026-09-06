"use client";

import { LayoutDashboard, MapPinned, GraduationCap, UserCog, Cpu } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "./dashboard-shell";
import { useLanguageStore } from "@/store/language-store";

interface TeacherSidebarProps {
  children: React.ReactNode;
}

export function TeacherSidebar({ children }: TeacherSidebarProps) {
  const language = useLanguageStore((state) => state.language);

  const navItems: DashboardNavItem[] = [
    {
      label: language === "en" ? "Dashboard" : "Panel principal",
      href: "/teacher/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: language === "en" ? "Students" : "Estudiantes",
      href: "/teacher/users",
      icon: GraduationCap,
    },
    {
      label: language === "en" ? "Teachers" : "Docentes",
      href: "/teacher/teachers",
      icon: UserCog,
    },
    {
      label: language === "en" ? "Protected Areas" : "Áreas protegidas",
      href: "/teacher/protected-areas",
      icon: MapPinned,
    },
    {
      label: language === "en" ? "AI Providers" : "Proveedores de IA",
      href: "/teacher/ai-providers",
      icon: Cpu,
    },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel={language === "en" ? "Teacher" : "Docente"}
      dashboardHref="/teacher/dashboard"
      profileHref="/teacher/profile"
    >
      {children}
    </DashboardShell>
  );
}
