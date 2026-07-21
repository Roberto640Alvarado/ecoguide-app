import { z } from "zod";
import { isBlankRichText } from "@/lib/utils/rich-text";

/** Espeja CreateSpeakingPracticeDto/UpdateSpeakingPracticeDto de la API. */
export const speakingPracticeSchema = z.object({
  protectedAreaId: z.string().min(1),
  title: z.string().min(1, "El título es requerido."),
  instructions: z
    .string()
    .refine(
      (value) => !isBlankRichText(value),
      "Las indicaciones son requeridas.",
    ),
  providerId: z.string().min(1, "Selecciona un proveedor de IA."),
  model: z.string().min(1, "Selecciona un modelo."),
  prompt: z
    .string()
    .refine((value) => !isBlankRichText(value), "El prompt es requerido."),
  isActive: z.boolean(),
});

export type SpeakingPracticeFormValues = z.infer<
  typeof speakingPracticeSchema
>;
