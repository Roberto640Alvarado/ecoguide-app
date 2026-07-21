import { z } from "zod";
import { isBlankRichText } from "@/lib/utils/rich-text";
import { FLASH_CARD_TYPES } from "../types/flash-card.types";

/**
 * Espeja CreateFlashCardDto/UpdateFlashCardDto. Un único esquema para crear y
 * editar (mismo patrón que ProtectedAreas): question/options/correctAnswer
 * solo son obligatorios cuando type === "ENVIRONMENTAL" (@ValidateIf en la
 * API), replicado aquí con superRefine.
 *
 * No incluye `order`: el maestro no lo captura, el backend lo asigna
 * automáticamente según el rango fijo de la categoría (ver
 * FLASH_CARD_TYPE_RANK en ecoguide-api) y la cantidad de flashcards ya
 * existentes de ese tipo en el área.
 */
export const flashCardSchema = z
  .object({
    type: z.enum(FLASH_CARD_TYPES, {
      message: "El tipo de flashcard no es válido.",
    }),
    title: z.string().min(1, "El título es requerido."),
    // RichTextEditor guarda HTML: un editor "vacío" produce "<p></p>", que
    // .min(1) por sí solo no detectaría como vacío.
    content: z
      .string()
      .min(1, "El contenido es requerido.")
      .refine((value) => !isBlankRichText(value), {
        message: "El contenido es requerido.",
      }),
    image: z
      .union([z.string().url("La imagen debe ser una URL válida."), z.literal("")])
      .optional(),
    question: z.string().optional(),
    // Sin .min(1) por elemento: el formulario siempre trae `options`
    // inicializado con dos strings vacíos (aunque el tipo no sea
    // ENVIRONMENTAL y esa sección esté oculta), así que validar cada
    // elemento aquí bloqueaba el envío de CUALQUIER categoría. Los
    // elementos vacíos se filtran y solo se exigen cuando type ===
    // "ENVIRONMENTAL", dentro del superRefine de abajo.
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "ENVIRONMENTAL") {
      return;
    }

    if (!data.question || data.question.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["question"],
        message:
          "La pregunta es requerida para flashcards de tipo ENVIRONMENTAL.",
      });
    }

    const nonEmptyOptions = (data.options ?? []).filter(
      (option) => option.trim().length > 0,
    );

    if (nonEmptyOptions.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message:
          "Debe haber al menos 2 opciones para flashcards de tipo ENVIRONMENTAL.",
      });
    }

    if (!data.correctAnswer || data.correctAnswer.trim().length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message:
          "La respuesta correcta es requerida para flashcards de tipo ENVIRONMENTAL.",
      });
    } else if (!nonEmptyOptions.includes(data.correctAnswer)) {
      ctx.addIssue({
        code: "custom",
        path: ["correctAnswer"],
        message: "La respuesta correcta debe ser una de las opciones proporcionadas.",
      });
    }
  });

export type FlashCardFormValues = z.infer<typeof flashCardSchema>;
