import { z } from "zod";
import { AI_PROVIDER_TYPES } from "../types/ai-provider.types";

/** Espeja CreateAIProviderDto (sin `models`: el catálogo se administra aparte). */
export const createAIProviderSchema = z.object({
  providerName: z
    .string()
    .min(1, "El nombre del proveedor es requerido."),
  providerType: z.enum(AI_PROVIDER_TYPES, {
    message: "El tipo de proveedor no es válido.",
  }),
  apiKey: z.string().min(1, "El apiKey es requerido."),
  isActive: z.boolean(),
});

export type CreateAIProviderFormValues = z.infer<
  typeof createAIProviderSchema
>;
