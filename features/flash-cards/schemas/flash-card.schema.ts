import { z } from "zod";
import { isBlankRichText } from "@/lib/utils/rich-text";
import {
  FLASH_CARD_TYPES,
  VOCABULARY_ITEMS_MAX,
  VOCABULARY_WORD_MAX_LENGTH,
} from "../types/flash-card.types";

/**
 * Sin .min(1) por palabra: igual que `options`, una fila vacía no debe
 * bloquear el envío de otra categoría (la sección está oculta). Se exige
 * en el superRefine solo cuando type === "VOCABULARY".
 */
const vocabularyItemSchema = z.object({
  wordEn: z
    .string()
    .max(
      VOCABULARY_WORD_MAX_LENGTH,
      `La palabra en inglés no puede superar ${VOCABULARY_WORD_MAX_LENGTH} caracteres.`,
    ),
  wordEs: z
    .string()
    .max(
      VOCABULARY_WORD_MAX_LENGTH,
      `La palabra en español no puede superar ${VOCABULARY_WORD_MAX_LENGTH} caracteres.`,
    ),
  audioEnUrl: z.string().nullable(),
  audioEsUrl: z.string().nullable(),
});

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
    // Requerido salvo en VOCABULARY (ver superRefine). RichTextEditor
    // guarda HTML: un editor "vacío" produce "<p></p>", por eso se valida
    // con isBlankRichText y no con .min(1).
    content: z.string(),
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
    vocabularyItems: z
      .array(vocabularyItemSchema)
      .max(
        VOCABULARY_ITEMS_MAX,
        `Una flashcard puede tener como máximo ${VOCABULARY_ITEMS_MAX} palabras.`,
      ),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "VOCABULARY" && isBlankRichText(data.content)) {
      ctx.addIssue({
        code: "custom",
        path: ["content"],
        message: "El contenido es requerido.",
      });
    }

    if (data.type === "VOCABULARY") {
      if (data.vocabularyItems.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["vocabularyItems"],
          message: "Agrega al menos una palabra de vocabulario.",
        });
      }

      data.vocabularyItems.forEach((item, index) => {
        if (item.wordEn.trim().length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["vocabularyItems", index, "wordEn"],
            message: "La palabra en inglés es requerida.",
          });
        }

        if (item.wordEs.trim().length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["vocabularyItems", index, "wordEs"],
            message: "La palabra en español es requerida.",
          });
        }
      });

      return;
    }

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
