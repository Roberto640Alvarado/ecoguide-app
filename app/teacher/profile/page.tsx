"use client";

import { UserCircle } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { ProfileForm } from "@/features/auth/components/profile-form";

export default function TeacherProfilePage() {
  const language = useLanguageStore((state) => state.language);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <UserCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {language === "en" ? "My profile" : "Mi perfil"}
          </h1>
          <p className="text-sm text-muted">
            {language === "en"
              ? "Update your personal info."
              : "Actualiza tu información personal."}
          </p>
        </div>
      </div>

      <ProfileForm />
    </div>
  );
}
