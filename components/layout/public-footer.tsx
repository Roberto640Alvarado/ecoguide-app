"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguageStore } from "@/store/language-store";
import { landingContent } from "@/lib/i18n/landing-content";

export function PublicFooter() {
  const language = useLanguageStore((state) => state.language);
  const t = landingContent[language].footer;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo.png"
            alt="EcoGuide Training"
            width={28}
            height={28}
            className="h-7 w-7 rounded-full"
          />
          <span>EcoGuide Training</span>
        </Link>

        <p className="text-sm text-muted">{t.tagline}</p>

        <p className="text-sm text-muted">
          © {year} EcoGuide Training. {t.rights}
        </p>
      </div>
    </footer>
  );
}
