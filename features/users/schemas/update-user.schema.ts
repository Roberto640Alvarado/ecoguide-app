import { z } from "zod";

/**
 * Espeja las reglas de UpdateUserDto en ecoguide-api (mismos campos, mismos
 * mensajes en español). No incluye avatarUrl ni password: el avatar lo elige
 * el propio estudiante en el registro, y la contraseña solo cambia por el
 * flujo de recuperación.
 */
export const updateUserSchema = z.object({
  name: z.string().min(1, "El nombre no puede estar vacío."),
  lastName: z.string().min(1, "El apellido no puede estar vacío."),
  email: z.string().email("El correo no es válido."),
  role: z.enum(["STUDENT", "TEACHER"], {
    message: "El rol debe ser STUDENT o TEACHER.",
  }),
  isActive: z.boolean(),
});

export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
