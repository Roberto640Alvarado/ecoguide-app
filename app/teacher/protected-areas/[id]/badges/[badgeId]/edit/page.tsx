"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Medal } from "lucide-react";
import { Spinner } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useBadge } from "@/features/badges/hooks/use-badge";
import { useUpdateBadge } from "@/features/badges/hooks/use-update-badge";
import { BadgeForm } from "@/features/badges/components/badge-form";
import type { BadgeFormValues } from "@/features/badges/schemas/badge.schema";

export default function EditBadgePage() {
  const params = useParams<{ id: string; badgeId: string }>();
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const { data: badge, isLoading } = useBadge(params.badgeId);
  const updateBadge = useUpdateBadge(params.badgeId, params.id);

  function handleSubmit(values: BadgeFormValues) {
    updateBadge.mutate(values, {
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
            {language === "en" ? "Edit badge" : "Editar insignia"}
          </h1>
          {badge && <p className="text-sm text-muted">{badge.name}</p>}
        </div>
      </div>

      <div className="w-full rounded-3xl border border-border bg-surface p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : !badge ? (
          <p className="text-center text-sm text-muted">
            {language === "en" ? "Badge not found." : "Insignia no encontrada."}
          </p>
        ) : (
          <BadgeForm
            defaultValues={{
              name: badge.name,
              description: badge.description,
              message: badge.message,
              imageUrl: badge.imageUrl,
            }}
            isSubmitting={updateBadge.isPending}
            submitLabel={language === "en" ? "Save changes" : "Guardar cambios"}
            onSubmit={handleSubmit}
            onCancel={() =>
              router.push(`/teacher/protected-areas/${params.id}/badges`)
            }
          />
        )}
      </div>
    </div>
  );
}
