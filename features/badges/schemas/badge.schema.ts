import { z } from "zod";

/**
 * Espeja CreateBadgeDto/UpdateBadgeDto. No incluye protectedAreaId: se
 * envía por separado al crear (viene de la ruta, no del formulario), y
 * nunca se edita (mismo criterio que FlashCard con protectedAreaId).
 */
export const badgeSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  description: z.string().min(1, "La descripción es requerida."),
  message: z.string().min(1, "El mensaje para el estudiante es requerido."),
  imageUrl: z
    .string()
    .min(1, "La imagen es requerida.")
    .url("La imagen debe ser una URL válida."),
});

export type BadgeFormValues = z.infer<typeof badgeSchema>;
