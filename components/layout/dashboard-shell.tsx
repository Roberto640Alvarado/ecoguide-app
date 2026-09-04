"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Languages, LogOut, Loader2, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import {
  PageTitleProvider,
  usePageTitleContext,
} from "@/components/layout/page-title-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

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
  profileHref: string;
  children: React.ReactNode;
}

// Sidebar de shadcn/ui (components/ui/sidebar.tsx): reemplaza al sidebar
// hecho a mano sobre Preline `hs-overlay`. En móvil se renderiza como un
// <Sheet> (drawer), en escritorio como panel fijo colapsable a modo ícono
// (`collapsible="icon"`). El estado (abierto/colapsado, mobile/desktop) lo
// maneja el propio `SidebarProvider` — ya no hace falta `useState` local.
function NavList({ navItems }: { navItems: DashboardNavItem[] }) {
  const pathname = usePathname();
  const language = useLanguageStore((state) => state.language);
  const shouldReduceMotion = useReducedMotion();

  return (
    <SidebarMenu>
      {navItems.map((item, index) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <motion.div
            key={item.href}
            initial={shouldReduceMotion ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.03, ease: "easeOut" }}
          >
            <SidebarMenuItem>
              {item.comingSoon ? (
                <SidebarMenuButton
                  disabled
                  className="cursor-not-allowed opacity-60"
                  tooltip={item.label}
                >
                  <Icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              ) : (
                <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              )}
              {item.comingSoon && (
                <SidebarMenuBadge>
                  {language === "en" ? "Soon" : "Pronto"}
                </SidebarMenuBadge>
              )}
            </SidebarMenuItem>
          </motion.div>
        );
      })}
    </SidebarMenu>
  );
}

// Contenido del topbar: mientras la página activa tenga un <PageHeader />
// montado (ver page-header.tsx), muestra su título — así el título del
// módulo vive arriba, junto al botón de colapsar sidebar, en vez de (solo)
// dentro del contenido. Las vistas que no usan <PageHeader /> (ej.
// dashboard, profile) caen de vuelta al logo de EcoGuide en mobile, igual
// que antes.
function TopbarBrand({ dashboardHref }: { dashboardHref: string }) {
  const { pageTitle } = usePageTitleContext();

  if (pageTitle.title) {
    return (
      <>
        <Separator orientation="vertical" className="h-5" />
        <h1 className="truncate text-lg font-bold text-foreground sm:text-xl">
          {pageTitle.title}
        </h1>
      </>
    );
  }

  return (
    <Link href={dashboardHref} className="flex items-center gap-2 md:hidden">
      <Image
        src="/logo.png"
        alt="EcoGuide Training"
        width={28}
        height={28}
        className="h-7 w-7 rounded-full"
      />
      <span className="font-semibold text-foreground">EcoGuide</span>
    </Link>
  );
}

export function DashboardShell({
  navItems,
  roleLabel,
  dashboardHref,
  profileHref,
  children,
}: DashboardShellProps) {
  const isHydrated = useAuthStore((state) => state.isHydrated);
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
        <Loader2
          className="size-6 animate-spin text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <PageTitleProvider>
      <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link
              href={dashboardHref}
              className="flex items-center gap-2 px-2 py-1 font-semibold text-lg text-sidebar-foreground focus:outline-hidden focus:opacity-80 group-data-[collapsible=icon]:justify-center"
            >
              <Image
                src="/logo.png"
                alt="EcoGuide Training"
                width={28}
                height={28}
                className="h-7 w-7 shrink-0 rounded-full"
              />
              <span className="group-data-[collapsible=icon]:hidden">
                EcoGuide
              </span>
            </Link>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <NavList navItems={navItems} />
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <Link
              href={profileHref}
              className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent"
            >
              <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="sm" />
              <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {user ? `${user.name} ${user.lastName}` : "..."}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {roleLabel}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2 group-data-[collapsible=icon]:flex-col">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                onClick={toggleLanguage}
                aria-label="Toggle language"
              >
                <Languages className="size-4 shrink-0" aria-hidden="true" />
                <span className="group-data-[collapsible=icon]:hidden">
                  {language === "en" ? "ES" : "EN"}
                </span>
              </Button>
              <ThemeToggle
                className="flex-1"
                labelClassName="group-data-[collapsible=icon]:hidden"
                labels={
                  language === "en"
                    ? { light: "Light", dark: "Dark" }
                    : { light: "Claro", dark: "Oscuro" }
                }
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => logout()}
              aria-label="Logout"
            >
              <LogOut className="size-4 shrink-0" aria-hidden="true" />
              <span className="group-data-[collapsible=icon]:hidden">
                {language === "en" ? "Log out" : "Salir"}
              </span>
            </Button>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <TopbarBrand dashboardHref={dashboardHref} />
          </header>
          <div className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-10 lg:pb-10 lg:pt-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </PageTitleProvider>
  );
}
