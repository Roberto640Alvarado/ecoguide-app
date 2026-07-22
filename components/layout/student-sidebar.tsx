"use client";

import { LayoutDashboard, MapPinned, TrendingUp } from "lucide-react";
import { DashboardShell, type DashboardNavItem } from "./dashboard-shell";
import { useLanguageStore } from "@/store/language-store";

interface StudentSidebarProps {
  children: React.ReactNode;
}

export function StudentSidebar({ children }: StudentSidebarProps) {
  const language = useLanguageStore((state) => state.language);

  // Sin item de menú para FlashCards: el estudiante siempre llega a ellas
  // desde el recorrido guiado de un área protegida específica
  // (/student/protected-areas/[id]/tour), nunca desde un listado global.
  const navItems: DashboardNavItem[] = [
    {
      label: language === "en" ? "Dashboard" : "Panel principal",
      href: "/student/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: language === "en" ? "Protected Areas" : "Áreas protegidas",
      href: "/student/protected-areas",
      icon: MapPinned,
    },
    {
      label: language === "en" ? "My progress" : "Mi progreso",
      href: "/student/progress",
      icon: TrendingUp,
    },
  ];

  return (
    <DashboardShell
      navItems={navItems}
      roleLabel={language === "en" ? "Student" : "Estudiante"}
      dashboardHref="/student/dashboard"
      profileHref="/student/profile"
    >
      {children}
    </DashboardShell>
  );
}
