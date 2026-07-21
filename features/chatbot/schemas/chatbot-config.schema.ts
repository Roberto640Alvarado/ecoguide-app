import { z } from "zod";
import { isBlankRichText } from "@/lib/utils/rich-text";

/** Espeja CreateChatbotConfigDto/UpdateChatbotConfigDto de la API. */
export const chatbotConfigSchema = z.object({
  protectedAreaId: z.string().min(1),
  providerId: z.string().min(1, "Selecciona un proveedor de IA."),
  model: z.string().min(1, "Selecciona un modelo."),
  systemPrompt: z
    .string()
    .refine(
      (value) => !isBlankRichText(value),
      "El systemPrompt es requerido.",
    ),
  welcomeMessage: z
    .string()
    .refine(
      (value) => !isBlankRichText(value),
      "El mensaje de bienvenida es requerido.",
    ),
  temperature: z
    .number()
    .min(0, "La temperatura mínima es 0.")
    .max(2, "La temperatura máxima es 2."),
  maxTokens: z.number().int().min(1, "maxTokens debe ser mayor a 0."),
  isActive: z.boolean(),
});

export type ChatbotConfigFormValues = z.infer<typeof chatbotConfigSchema>;
