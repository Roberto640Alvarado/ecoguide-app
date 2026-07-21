"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPinned } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useCreateProtectedArea } from "@/features/protected-areas/hooks/use-create-protected-area";
import { ProtectedAreaForm } from "@/features/protected-areas/components/protected-area-form";
import type { ProtectedAreaFormValues } from "@/features/protected-areas/schemas/protected-area.schema";

export default function NewProtectedAreaPage() {
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const createArea = useCreateProtectedArea();

  function handleSubmit(values: ProtectedAreaFormValues) {
    createArea.mutate(values, {
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

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <MapPinned className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {language === "en" ? "New protected area" : "Nueva área protegida"}
          </h1>
          <p className="text-sm text-muted">
            {language === "en"
              ? "Mark the location on the map and fill in the details."
              : "Marca la ubicación en el mapa y completa los detalles."}
          </p>
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl border border-border bg-surface p-6">
        <ProtectedAreaForm
          isSubmitting={createArea.isPending}
          submitLabel={language === "en" ? "Create area" : "Crear área"}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/teacher/protected-areas")}
        />
      </div>
    </div>
  );
}
