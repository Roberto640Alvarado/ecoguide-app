"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useLanguageStore } from "@/store/language-store";
import { useCreateFlashCard } from "@/features/flash-cards/hooks/use-create-flash-card";
import { FlashCardForm } from "@/features/flash-cards/components/flash-card-form";
import type { FlashCardFormValues } from "@/features/flash-cards/schemas/flash-card.schema";

export default function NewFlashCardPage() {
  const params = useParams<{ id: string }>();
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const createFlashCard = useCreateFlashCard(params.id);

  function handleSubmit(values: FlashCardFormValues) {
    createFlashCard.mutate(values, {
      onSuccess: () =>
        router.push(`/teacher/protected-areas/${params.id}/flash-cards`),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={`/teacher/protected-areas/${params.id}/flash-cards`}
        className="flex items-center gap-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        {language === "en" ? "Back to flashcards" : "Volver a flashcards"}
      </Link>

      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent-soft-foreground">
          <BookOpen className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {language === "en" ? "New flashcard" : "Nueva flashcard"}
          </h1>
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl border border-border bg-surface p-6">
        <FlashCardForm
          isSubmitting={createFlashCard.isPending}
          submitLabel={language === "en" ? "Create flashcard" : "Crear flashcard"}
          onSubmit={handleSubmit}
          onCancel={() =>
            router.push(`/teacher/protected-areas/${params.id}/flash-cards`)
          }
        />
      </div>
    </div>
  );
}
