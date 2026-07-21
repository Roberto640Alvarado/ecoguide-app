import { z } from "zod";
import { isBlankRichText } from "@/lib/utils/rich-text";

/**
 * Espeja CreateProtectedAreaDto/UpdateProtectedAreaDto. Se usa un único
 * esquema para crear y editar (en vez de dos, como en AIProviders) porque
 * el formulario siempre muestra y envía todos los campos: el mapa
 * garantiza que latitude/longitude siempre tengan un valor válido, así que
 * no existe el caso "campo opcional en blanco" que sí aplica a apiKey.
 *
 * `images` contiene URLs de Cloudinary ya subidas (ver ImageUploader): el
 * formulario nunca envía archivos directamente al crear/editar el área, solo
 * las URLs devueltas por POST /upload-files.
 */
export const protectedAreaSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  // RichTextEditor guarda HTML: un editor "vacío" produce "<p></p>", que
  // .min(1) por sí solo no detectaría como vacío.
  description: z
    .string()
    .min(1, "La descripción es requerida.")
    .refine((value) => !isBlankRichText(value), {
      message: "La descripción es requerida.",
    }),
  latitude: z
    .number()
    .min(-90, "La latitud debe estar entre -90 y 90.")
    .max(90, "La latitud debe estar entre -90 y 90."),
  longitude: z
    .number()
    .min(-180, "La longitud debe estar entre -180 y 180.")
    .max(180, "La longitud debe estar entre -180 y 180."),
  images: z
    .array(z.string().url("Cada imagen debe ser una URL válida."))
    .max(10, "Máximo 10 imágenes por área."),
  isPublished: z.boolean(),
});

export type ProtectedAreaFormValues = z.infer<typeof protectedAreaSchema>;
