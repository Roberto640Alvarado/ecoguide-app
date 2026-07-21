import { z } from "zod";

const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

export const registerSchema = z
  .object({
    name: z.string().min(1, "El nombre es requerido."),
    lastName: z.string().min(1, "El apellido es requerido."),
    email: z.string().email("El correo no es válido."),
    password: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres.")
      .regex(
        PASSWORD_REGEX,
        "La contraseña debe contener al menos una letra y un número.",
      ),
    confirmPassword: z.string().min(1, "Confirma tu contraseña."),
    avatarUrl: z.string().min(1, "Selecciona un avatar."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
