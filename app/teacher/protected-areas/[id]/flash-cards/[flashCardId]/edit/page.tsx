"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Spinner } from "@heroui/react";
import { useLanguageStore } from "@/store/language-store";
import { useFlashCard } from "@/features/flash-cards/hooks/use-flash-card";
import { useUpdateFlashCard } from "@/features/flash-cards/hooks/use-update-flash-card";
import { FlashCardForm } from "@/features/flash-cards/components/flash-card-form";
import type { FlashCardFormValues } from "@/features/flash-cards/schemas/flash-card.schema";

export default function EditFlashCardPage() {
  const params = useParams<{ id: string; flashCardId: string }>();
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const { data: flashCard, isLoading } = useFlashCard(params.flashCardId);
  const updateFlashCard = useUpdateFlashCard(params.flashCardId, params.id);

  function handleSubmit(values: FlashCardFormValues) {
    updateFlashCard.mutate(values, {
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
            {language === "en" ? "Edit flashcard" : "Editar flashcard"}
          </h1>
          {flashCard && <p className="text-sm text-muted">{flashCard.title}</p>}
        </div>
      </div>

      <div className="max-w-2xl rounded-3xl border border-border bg-surface p-6">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Spinner size="md" />
          </div>
        ) : !flashCard ? (
          <p className="text-center text-sm text-muted">
            {language === "en"
              ? "Flashcard not found."
              : "Flashcard no encontrada."}
          </p>
        ) : (
          <FlashCardForm
            defaultValues={{
              type: flashCard.type,
              title: flashCard.title,
              content: flashCard.content,
              image: flashCard.image ?? "",
              question: flashCard.question ?? "",
              options: flashCard.options.length ? flashCard.options : ["", ""],
              correctAnswer: flashCard.correctAnswer ?? "",
            }}
            isSubmitting={updateFlashCard.isPending}
            submitLabel={language === "en" ? "Save changes" : "Guardar cambios"}
            onSubmit={handleSubmit}
            onCancel={() =>
              router.push(`/teacher/protected-areas/${params.id}/flash-cards`)
            }
          />
        )}
      </div>
    </div>
  );
}
