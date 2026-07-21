"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Button, Spinner } from "@heroui/react";
import { Languages, LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { UserAvatar } from "@/components/ui/user-avatar";

export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  comingSoon?: boolean;
}

interface DashboardShellProps {
  navItems: DashboardNavItem[];
  roleLabel: string;
  dashboardHref: string;
  children: React.ReactNode;
}

function NavLink({
  item,
  isActive,
  onNavigate,
}: {
  item: DashboardNavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;

  if (item.comingSoon) {
    return (
      <span className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted/60">
        <Icon className="h-4 w-4" aria-hidden="true" />
        {item.label}
        <span className="ml-auto rounded-full bg-default-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          Pronto
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        isActive
          ? "bg-accent-soft text-accent-soft-foreground"
          : "text-muted hover:bg-surface-secondary hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {item.label}
    </Link>
  );
}

function SidebarContent({
  navItems,
  roleLabel,
  dashboardHref,
  onNavigate,
}: {
  navItems: DashboardNavItem[];
  roleLabel: string;
  dashboardHref: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const logout = useLogout();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link
        href={dashboardHref}
        onClick={onNavigate}
        className="flex items-center gap-2 px-2 font-semibold text-foreground"
      >
        <Image
          src="/logo.png"
          alt="EcoGuide Training"
          width={32}
          height={32}
          className="h-8 w-8 rounded-full"
        />
        <span className="text-base tracking-tight">EcoGuide</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-secondary p-3">
        <div className="flex items-center gap-3">
          <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {user ? `${user.name} ${user.lastName}` : "..."}
            </p>
            <p className="truncate text-xs text-muted">{roleLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onPress={toggleLanguage}
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            {language === "en" ? "ES" : "EN"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onPress={() => logout()}
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            {language === "en" ? "Log out" : "Salir"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  navItems,
  roleLabel,
  dashboardHref,
  children,
}: DashboardShellProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  // Evita que las páginas hijas disparen requests (React Query, etc.) antes
  // de que useSessionHydration termine de rehidratar el accessToken desde la
  // cookie httpOnly. Sin este gate, una carga directa/dura de una ruta con
  // fetch en el mount (ej. /teacher/protected-areas/[id]/edit) puede salir
  // sin el header Authorization, recibir 401 y el interceptor de Axios
  // fuerza un redirect a /login antes de que la hidratación alcance a
  // completarse.
  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="md" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar fijo en desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-border bg-surface lg:block">
        <SidebarContent
          navItems={navItems}
          roleLabel={roleLabel}
          dashboardHref={dashboardHref}
        />
      </aside>

      {/* Topbar móvil */}
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md lg:hidden">
        <Link href={dashboardHref} className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="EcoGuide Training"
            width={28}
            height={28}
            className="h-7 w-7 rounded-full"
          />
          <span className="font-semibold text-foreground">EcoGuide</span>
        </Link>
        <Button
          variant="ghost"
          size="sm"
          isIconOnly
          onPress={() => setIsMobileOpen(true)}
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </Button>
      </header>

      {/* Drawer móvil */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-backdrop lg:hidden"
              onClick={() => setIsMobileOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-surface shadow-xl lg:hidden"
            >
              <div className="flex justify-end p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  onPress={() => setIsMobileOpen(false)}
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </Button>
              </div>
              <SidebarContent
                navItems={navItems}
                roleLabel={roleLabel}
                dashboardHref={dashboardHref}
                onNavigate={() => setIsMobileOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <main className="p-4 sm:p-6 lg:ml-64 lg:p-10">{children}</main>
    </div>
  );
}
