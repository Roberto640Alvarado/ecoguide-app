"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { Languages, LogOut } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useAuthStore } from "@/store/auth-store";
import { landingContent } from "@/lib/i18n/landing-content";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { getDashboardPath } from "@/features/auth/utils/get-dashboard-path";
import { UserAvatar } from "@/components/ui/user-avatar";

export function PublicNavbar() {
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
      className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="EcoGuide Training"
            width={36}
            height={36}
            className="h-9 w-9 rounded-full"
            priority
          />
          <span className="hidden text-lg tracking-tight sm:inline">
            EcoGuide Training
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="sm"
            onPress={toggleLanguage}
            aria-label="Toggle language"
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t.languageToggleLabel}</span>
          </Button>

          {user ? (
            <>
              <span className="hidden items-center gap-2 text-sm text-muted sm:flex">
                <UserAvatar
                  name={user.name}
                  avatarUrl={user.avatarUrl}
                  size="sm"
                />
                {language === "en" ? "Hi" : "Hola"}, {user.name}
              </span>
              <Link
                href={getDashboardPath(user.role)}
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                {language === "en" ? "Go to dashboard" : "Ir al panel"}
              </Link>
              <Button
                variant="outline"
                size="sm"
                onPress={() => logout()}
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
                className={buttonVariants({ variant: "outline", size: "sm" })}
              >
                {t.login}
              </Link>

              <Link
                href="/register"
                className={buttonVariants({ variant: "primary", size: "sm" })}
              >
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
