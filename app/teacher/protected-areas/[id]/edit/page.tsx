"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";
import { Button, Spinner } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useProtectedArea } from "@/features/protected-areas/hooks/use-protected-area";
import { useUpdateProtectedArea } from "@/features/protected-areas/hooks/use-update-protected-area";
import { ProtectedAreaForm } from "@/features/protected-areas/components/protected-area-form";
import type { ProtectedAreaFormValues } from "@/features/protected-areas/schemas/protected-area.schema";

export default function EditProtectedAreaPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const { data: area, isLoading } = useProtectedArea(params.id);
  const updateArea = useUpdateProtectedArea(params.id);

  function handleSubmit(values: ProtectedAreaFormValues) {
    updateArea.mutate(values, {
      onSuccess: () => router.push("/teacher/protected-areas"),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/teacher/protected-areas"
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to protected areas" : "Volver a áreas protegidas"}
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
            <MapPinned className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {language === "en" ? "Edit protected area" : "Editar área protegida"}
            </h1>
            {area && <p className="text-sm text-muted">{area.name}</p>}
          </div>
        </div>
        <Link href={`/teacher/protected-areas/${params.id}/flash-cards`}>
          <Button variant="outline" size="sm">
            {language === "en" ? "Manage FlashCards" : "Administrar FlashCards"}
          </Button>
        </Link>
      </div>

      <div className="max-w-2xl rounded-3xl border border-border bg-surface p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : !area ? (
          <p className="text-center text-sm text-muted">
            {language === "en"
              ? "Protected area not found."
              : "Área protegida no encontrada."}
          </p>
        ) : (
          <ProtectedAreaForm
            defaultValues={{
              name: area.name,
              description: area.description,
              latitude: area.latitude,
              longitude: area.longitude,
              images: area.images,
              isPublished: area.isPublished,
            }}
            isSubmitting={updateArea.isPending}
            submitLabel={language === "en" ? "Save changes" : "Guardar cambios"}
            onSubmit={handleSubmit}
            onCancel={() => router.push("/teacher/protected-areas")}
          />
        )}
      </div>
    </div>
  );
}
