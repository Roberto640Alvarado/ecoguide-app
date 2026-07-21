"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Button, Spinner } from "@heroui/react";
import {
  Languages,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";
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

// Sidebar Preline UI "Content Push to Mini Sidebar" adaptado: un único
// elemento fijo que en móvil se desliza como overlay (hs-overlay) y en
// escritorio permanece siempre visible, colapsable a modo icono (React
// state). El `lg:hidden` condicional en los labels asegura que el modo
// "mini" solo aplique a partir del breakpoint lg, nunca al drawer móvil.
const SIDEBAR_ID = "hs-app-sidebar";

function NavLink({
  item,
  isActive,
  isCollapsed,
  onNavigate,
}: {
  item: DashboardNavItem;
  isActive: boolean;
  isCollapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const labelClassName = isCollapsed ? "lg:hidden" : "";

  if (item.comingSoon) {
    return (
      <span className="min-h-[36px] flex items-center gap-x-3.5 py-2 px-2.5 text-sm text-muted/60 rounded-lg cursor-not-allowed">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className={`text-nowrap flex items-center gap-1.5 ${labelClassName}`}>
          {item.label}
          <span className="py-0.5 px-1.5 inline-flex items-center gap-x-1.5 text-xs bg-surface-1 text-surface-foreground rounded-full">
            Pronto
          </span>
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={isCollapsed ? item.label : undefined}
      className={`min-h-[36px] flex items-center gap-x-3.5 py-2 px-2.5 text-sm rounded-lg focus:outline-hidden ${
        isActive
          ? "bg-sidebar-nav-active text-sidebar-nav-foreground"
          : "text-sidebar-nav-foreground hover:bg-sidebar-nav-hover focus:bg-sidebar-nav-focus"
      }`}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className={`text-nowrap ${labelClassName}`}>{item.label}</span>
    </Link>
  );
}

export function DashboardShell({
  navItems,
  roleLabel,
  dashboardHref,
  children,
}: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const logout = useLogout();

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

  const labelClassName = isCollapsed ? "lg:hidden" : "";

  return (
    <div className="min-h-screen bg-background">
      {/* Topbar móvil: dispara el overlay del sidebar */}
      <header className="lg:hidden sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md">
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
        <button
          type="button"
          className="py-2 px-3 inline-flex justify-center items-center gap-x-2 text-sm font-medium bg-secondary border border-secondary-line text-secondary-foreground rounded-lg shadow-2xs hover:bg-secondary-hover focus:outline-hidden focus:bg-secondary-focus"
          aria-haspopup="dialog"
          aria-expanded="false"
          aria-controls={SIDEBAR_ID}
          data-hs-overlay={`#${SIDEBAR_ID}`}
        >
          <Menu className="size-4" aria-hidden="true" />
          <span className="sr-only">
            {language === "en" ? "Open menu" : "Abrir menú"}
          </span>
        </button>
      </header>

      {/* Sidebar: overlay en móvil, fijo y colapsable en escritorio */}
      <div
        id={SIDEBAR_ID}
        className={`hs-overlay [--auto-close:lg] lg:block lg:translate-x-0 lg:inset-e-auto lg:bottom-0 hs-overlay-open:translate-x-0 -translate-x-full transition-all duration-300 transform h-full hidden overflow-x-hidden fixed top-0 inset-s-0 bottom-0 z-60 bg-sidebar border-e border-sidebar-line w-64 ${
          isCollapsed ? "lg:w-16" : "lg:w-64"
        }`}
        role="dialog"
        tabIndex={-1}
        aria-label="Sidebar"
      >
        <div className="relative flex flex-col h-full max-h-full">
          {/* Header */}
          <header className="py-4 px-2 flex justify-between items-center gap-x-2">
            <Link
              href={dashboardHref}
              className={`flex-none font-semibold text-xl text-layer-foreground focus:outline-hidden focus:opacity-80 ${labelClassName}`}
            >
              EcoGuide
            </Link>

            <div className="lg:hidden">
              {/* Close Button (móvil) */}
              <button
                type="button"
                className="flex justify-center items-center gap-x-3 size-6 bg-layer border border-layer-line text-sm text-muted-foreground-2 hover:bg-layer-hover rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-layer-focus"
                aria-controls={SIDEBAR_ID}
                data-hs-overlay={`#${SIDEBAR_ID}`}
              >
                <X className="size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">
                  {language === "en" ? "Close" : "Cerrar"}
                </span>
              </button>
            </div>

            <div className="hidden lg:block">
              {/* Toggle Button (colapsar/expandir, solo escritorio) */}
              <button
                type="button"
                onClick={() => setIsCollapsed((collapsed) => !collapsed)}
                className="flex justify-center items-center flex-none gap-x-3 size-9 text-sm text-muted-foreground-2 hover:bg-muted-hover rounded-full disabled:opacity-50 disabled:pointer-events-none focus:outline-hidden focus:bg-muted-focus"
                aria-expanded={!isCollapsed}
                aria-label={
                  isCollapsed
                    ? language === "en"
                      ? "Expand navigation"
                      : "Expandir navegación"
                    : language === "en"
                      ? "Minify navigation"
                      : "Minimizar navegación"
                }
              >
                {isCollapsed ? (
                  <PanelLeftOpen className="size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <PanelLeftClose className="size-4 shrink-0" aria-hidden="true" />
                )}
              </button>
            </div>
          </header>

          {/* Body */}
          <nav className="h-full overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-track]:bg-scrollbar-track [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb">
            <div className="pb-0 px-2 w-full flex flex-col flex-wrap">
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      isActive={pathname === item.href}
                      isCollapsed={isCollapsed}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          {/* End Body */}

          {/* Footer: usuario, idioma, logout */}
          <div className="p-2">
            <div className="flex flex-col gap-2 rounded-lg border border-layer-line bg-layer p-2">
              <div className="flex items-center gap-3 px-1">
                <UserAvatar
                  name={user?.name}
                  avatarUrl={user?.avatarUrl}
                  size="sm"
                />
                <div className={`min-w-0 ${labelClassName}`}>
                  <p className="truncate text-sm font-semibold text-layer-foreground">
                    {user ? `${user.name} ${user.lastName}` : "..."}
                  </p>
                  <p className="truncate text-xs text-muted-foreground-2">
                    {roleLabel}
                  </p>
                </div>
              </div>

              <div className={`flex items-center gap-2 ${isCollapsed ? "lg:flex-col" : ""}`}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onPress={toggleLanguage}
                  aria-label="Toggle language"
                >
                  <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className={labelClassName}>
                    {language === "en" ? "ES" : "EN"}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onPress={() => logout()}
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className={labelClassName}>
                    {language === "en" ? "Log out" : "Salir"}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Sidebar */}

      <main
        className={`p-4 sm:p-6 lg:p-10 transition-[margin] duration-300 ${
          isCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
