"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Medal } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useCreateBadge } from "@/features/badges/hooks/use-create-badge";
import { BadgeForm } from "@/features/badges/components/badge-form";
import type { BadgeFormValues } from "@/features/badges/schemas/badge.schema";

export default function NewBadgePage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const createBadge = useCreateBadge(params.id);

  function handleSubmit(values: BadgeFormValues) {
    createBadge.mutate(values, {
      onSuccess: () =>
        router.push(`/teacher/protected-areas/${params.id}/badges`),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/teacher/protected-areas/${params.id}/badges`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to badges" : "Volver a insignias"}
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <Medal className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {language === "en" ? "New badge" : "Nueva insignia"}
          </h1>
        </div>
      </div>

      <div className="w-full rounded-3xl border border-border bg-surface p-6">
        <BadgeForm
          isSubmitting={createBadge.isPending}
          submitLabel={language === "en" ? "Create badge" : "Crear insignia"}
          onSubmit={handleSubmit}
          onCancel={() =>
            router.push(`/teacher/protected-areas/${params.id}/badges`)
          }
        />
      </div>
    </div>
  );
}
