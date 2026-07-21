import { z } from "zod";

/** Espeja CreateModelDto/UpdateModelDto del catálogo de modelos. */
export const modelSchema = z.object({
  name: z.string().min(1, "El nombre del modelo es requerido."),
  model: z.string().min(1, "El identificador del modelo es requerido."),
  isActive: z.boolean(),
});

export type ModelFormValues = z.infer<typeof modelSchema>;
