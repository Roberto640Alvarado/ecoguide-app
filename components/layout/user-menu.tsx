"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronsUpDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  UserRound,
} from "lucide-react";
import { useAuthStore } from "@/store/auth-store";
import { useLanguageStore } from "@/store/language-store";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface UserMenuProps {
  roleLabel: string;
  profileHref: string;
  dashboardHref: string;
}

function RoleBadge({ label }: { label: string }) {
  return (
    <span className="inline-flex w-fit items-center rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-semibold leading-none text-primary">
      {label}
    </span>
  );
}

/**
 * Tarjeta del usuario al pie del sidebar. Al tocarla abre un menú con sus
 * datos (nombre, correo, rol), accesos a su perfil y al inicio, y "Cerrar
 * sesión" separado y en rojo. Con el sidebar colapsado queda solo el avatar.
 * El idioma y el tema viven en el encabezado (arriba a la derecha).
 */
export function UserMenu({ roleLabel, profileHref, dashboardHref }: UserMenuProps) {
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const logout = useLogout();
  const { isMobile, state } = useSidebar();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const en = language === "en";
  const fullName = user ? `${user.name} ${user.lastName}` : "…";

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={fullName}
              className="h-auto rounded-xl border border-sidebar-border bg-sidebar px-2.5 py-2 shadow-xs data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:border-transparent group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none"
            >
              <UserAvatar
                name={user?.name}
                avatarUrl={user?.avatarUrl}
                size="md"
                className="group-data-[collapsible=icon]:size-8"
              />
              <span className="flex min-w-0 flex-1 flex-col gap-1 text-left">
                <span className="truncate text-sm font-semibold text-sidebar-foreground">
                  {fullName}
                </span>
                <RoleBadge label={roleLabel} />
              </span>
              <ChevronsUpDown
                className="ml-auto size-4 text-muted-foreground"
                aria-hidden="true"
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side={isMobile || state === "expanded" ? "top" : "right"}
            align={isMobile || state === "expanded" ? "start" : "end"}
            sideOffset={8}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64 rounded-2xl p-1.5"
          >
            <DropdownMenuLabel className="flex items-center gap-3 px-2 py-2.5 font-normal">
              <UserAvatar name={user?.name} avatarUrl={user?.avatarUrl} size="md" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-semibold text-foreground">
                  {fullName}
                </span>
                {user?.email && (
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                )}
                <RoleBadge label={roleLabel} />
              </span>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="gap-2.5 rounded-lg px-2.5 py-2">
                <Link href={profileHref}>
                  <UserRound aria-hidden="true" />
                  {en ? "My profile" : "Mi perfil"}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="gap-2.5 rounded-lg px-2.5 py-2">
                <Link href={dashboardHref}>
                  <LayoutDashboard aria-hidden="true" />
                  {en ? "Dashboard" : "Panel principal"}
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              disabled={isLoggingOut}
              onSelect={(event) => {
                // Mantiene el menú abierto mientras se cierra la sesión
                // para mostrar el spinner.
                event.preventDefault();
                void handleLogout();
              }}
              className="gap-2.5 rounded-lg px-2.5 py-2 font-medium"
            >
              {isLoggingOut ? (
                <Loader2 className="animate-spin" aria-hidden="true" />
              ) : (
                <LogOut aria-hidden="true" />
              )}
              {en ? "Log out" : "Cerrar sesión"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
