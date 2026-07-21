import { z } from "zod";

/**
 * A propósito no incluye `email`: la vista de "editar mi perfil" nunca
 * permite cambiar el correo (ver UpdateProfileDto en la API, que tampoco lo
 * recibe). El cambio de contraseña sigue yendo por el flujo de
 * recuperación existente (/forgot-password).
 */
export const updateProfileSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  lastName: z.string().min(1, "El apellido es requerido."),
  avatarUrl: z.string().min(1, "Selecciona un avatar."),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;
