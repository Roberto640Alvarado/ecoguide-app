import { z } from "zod";

/** Espeja CreateAIProviderDto (sin `models`: el catálogo se administra aparte). */
export const createAIProviderSchema = z.object({
  providerName: z
    .string()
    .min(1, "El nombre del proveedor es requerido."),
  apiKey: z.string().min(1, "El apiKey es requerido."),
  isActive: z.boolean(),
});

export type CreateAIProviderFormValues = z.infer<
  typeof createAIProviderSchema
>;
