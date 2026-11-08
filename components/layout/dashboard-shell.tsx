"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2, type LucideIcon } from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { Separator } from "@/components/ui/separator";
import { InstallAppButton } from "@/components/layout/install-app-button";
import { LanguageSwitch } from "@/components/layout/language-switch";
import { ThemeSwitch } from "@/components/layout/theme-switch";
import { UserMenu } from "@/components/layout/user-menu";
import { BrandLogo, BrandWordmark } from "@/components/brand/brand-logo";
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
  useSidebar,
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
// En móvil el sidebar es un drawer (<Sheet>) que no se cierra solo al
// navegar: al cambiar de ruta (nav, perfil, logo, etc.) lo cerramos para que
// no tape la vista nueva. En escritorio `openMobile` no se usa, así que es
// inocuo.
function CloseMobileSidebarOnNavigate() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return null;
}

function NavList({ navItems }: { navItems: DashboardNavItem[] }) {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
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
                  <Link href={item.href} onClick={() => setOpenMobile(false)}>
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
        <h1 className="min-w-0 truncate text-lg font-bold text-foreground sm:text-xl">
          {pageTitle.title}
        </h1>
      </>
    );
  }

  return (
    <Link
      href={dashboardHref}
      aria-label="EcoGuide Training"
      className="flex items-center gap-2.5 rounded-md py-1 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
    >
      <BrandLogo className="h-8" />
      <BrandWordmark className="text-lg text-foreground" />
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
        <CloseMobileSidebarOnNavigate />
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Link
              href={dashboardHref}
              aria-label="EcoGuide Training"
              className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sidebar-foreground transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            >
              <BrandLogo className="h-10 group-data-[collapsible=icon]:h-6" />
              <BrandWordmark className="text-xl group-data-[collapsible=icon]:hidden" />
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
            <InstallAppButton />
            <UserMenu
              roleLabel={roleLabel}
              profileHref={profileHref}
              dashboardHref={dashboardHref}
            />
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
            <SidebarTrigger />
            <TopbarBrand dashboardHref={dashboardHref} />
            {/* Preferencias de la interfaz: siempre a la vista, arriba a la
                derecha, en todos los tamaños de pantalla. */}
            <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
              <LanguageSwitch />
              <ThemeSwitch />
            </div>
          </header>
          <div className="px-4 pb-4 pt-2 sm:px-6 sm:pb-6 sm:pt-3 lg:px-10 lg:pb-10 lg:pt-4">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </PageTitleProvider>
  );
}
