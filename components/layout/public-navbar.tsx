"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { BrandLogo } from "@/components/brand/brand-logo";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Languages, LogOut } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useAuthStore } from "@/store/auth-store";
import { landingContent } from "@/lib/i18n/landing-content";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { getDashboardPath } from "@/features/auth/utils/get-dashboard-path";
import { UserAvatar } from "@/components/ui/user-avatar";

/**
 * true cuando la página ya bajó más de `threshold` px. useSyncExternalStore
 * (en vez de useState+useEffect) para suscribirse al scroll; el snapshot es
 * un booleano, así que solo re-renderiza al cruzar el umbral.
 */
function useScrolledPast(threshold: number): boolean {
  return useSyncExternalStore(
    (callback) => {
      window.addEventListener("scroll", callback, { passive: true });
      return () => window.removeEventListener("scroll", callback);
    },
    () => window.scrollY > threshold,
    () => false,
  );
}

export function PublicNavbar() {
  // Sobre la foto del hero el cristal es oscuro con texto blanco; al bajar
  // (fondo claro/oscuro del tema) pasa a un cristal que sigue al tema.
  const scrolled = useScrolledPast(48);

  // Hover/foco de los botones "ghost" sobre el cristal: un velo translúcido
  // (blanco sobre la foto, del color del texto sobre el tema) en lugar del
  // gris sólido por defecto, que dejaba el texto blanco casi ilegible.
  const glassGhostClass = scrolled
    ? "transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:border-foreground/30 focus-visible:ring-foreground/15"
    : "transition-colors hover:bg-white/20 hover:text-white focus-visible:border-white/60 focus-visible:ring-white/25";
  const language = useLanguageStore((state) => state.language);
  const toggleLanguage = useLanguageStore((state) => state.toggleLanguage);
  const user = useAuthStore((state) => state.user);
  const t = landingContent[language].nav;
  const logout = useLogout();

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        data-tone={scrolled ? "auto" : "dark"}
        className={`liquid-glass w-full transition-colors duration-300 ${
          scrolled ? "text-foreground" : "text-white"
        }`}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold transition-opacity hover:opacity-80"
          >
            <BrandLogo className="h-9" />
            <span className="hidden text-lg tracking-tight sm:inline">
              EcoGuide Training
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <ThemeToggle
              className={glassGhostClass}
              labelClassName="hidden sm:inline"
              labels={
                language === "en"
                  ? { light: "Light", dark: "Dark" }
                  : { light: "Claro", dark: "Oscuro" }
              }
            />

            <Button
              variant="ghost"
              size="sm"
              className={glassGhostClass}
              onClick={toggleLanguage}
              aria-label="Toggle language"
            >
              <Languages className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{t.languageToggleLabel}</span>
            </Button>

            {user ? (
              <>
                <span className="hidden items-center gap-2 text-sm text-current/80 sm:flex">
                  <UserAvatar
                    name={user.name}
                    avatarUrl={user.avatarUrl}
                    size="sm"
                  />
                  {language === "en" ? "Hi" : "Hola"}, {user.name}
                </span>
                <Link
                  href={getDashboardPath(user.role)}
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  {language === "en" ? "Go to dashboard" : "Ir al panel"}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-foreground"
                  onClick={() => logout()}
                  aria-label="Logout"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {language === "en" ? "Log out" : "Salir"}
                  </span>
                </Button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${buttonVariants({ variant: "outline", size: "sm" })} text-foreground`}
                >
                  {t.login}
                </Link>

                <Link
                  href="/register"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  {t.register}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
