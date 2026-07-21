import { z } from "zod";
import { AI_PROVIDER_TYPES } from "../types/ai-provider.types";

/**
 * Espeja UpdateAIProviderDto. apiKey queda opcional en el formulario: si se
 * deja en blanco, el proveedor conserva la clave ya guardada (nunca se
 * muestra en claro, así que no tiene sentido forzar a reescribirla).
 */
export const updateAIProviderSchema = z.object({
  providerName: z
    .string()
    .min(1, "El nombre del proveedor es requerido."),
  providerType: z.enum(AI_PROVIDER_TYPES, {
    message: "El tipo de proveedor no es válido.",
  }),
  apiKey: z.string().optional(),
  isActive: z.boolean(),
});

export type UpdateAIProviderFormValues = z.infer<
  typeof updateAIProviderSchema
>;
