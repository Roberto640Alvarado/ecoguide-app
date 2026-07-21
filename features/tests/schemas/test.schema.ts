import { z } from "zod";

/** Espeja CreateQuestionDto de la API. */
const questionSchema = z.object({
  question: z.string().min(3, "La pregunta debe tener al menos 3 caracteres."),
  options: z.array(z.string()).min(2, "Cada pregunta necesita al menos 2 opciones."),
  correctAnswer: z.string(),
  score: z.number().int().min(1, "El puntaje debe ser mayor a 0."),
});

/**
 * Espeja CreateTestDto/UpdateTestDto de la API. La validación cruzada
 * (respuesta correcta dentro de las opciones, puntaje mínimo no mayor al
 * total posible) vive en superRefine, igual patrón que flashCardSchema, para
 * poder anclar cada error al campo exacto (ej. `questions.0.correctAnswer`).
 */
export const testSchema = z
  .object({
    protectedAreaId: z.string().min(1),
    title: z.string().min(3, "El título debe tener al menos 3 caracteres."),
    description: z
      .string()
      .min(10, "La descripción debe tener al menos 10 caracteres."),
    maxAttempts: z.number().int().min(1, "Debe permitir al menos 1 intento."),
    passingScore: z
      .number()
      .int()
      .min(0, "El puntaje mínimo no puede ser negativo."),
    questions: z.array(questionSchema).min(1, "Agrega al menos 1 pregunta."),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    data.questions.forEach((question, index) => {
      const nonEmptyOptions = question.options.filter(
        (option) => option.trim().length > 0,
      );

      if (nonEmptyOptions.length < 2) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "options"],
          message: "Cada pregunta necesita al menos 2 opciones con texto.",
        });
      }

      if (
        question.correctAnswer.trim().length === 0 ||
        !nonEmptyOptions.includes(question.correctAnswer)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["questions", index, "correctAnswer"],
          message: "Selecciona cuál opción es la respuesta correcta.",
        });
      }
    });

    const totalScore = data.questions.reduce((sum, q) => sum + (q.score || 0), 0);

    if (data.passingScore > totalScore) {
      ctx.addIssue({
        code: "custom",
        path: ["passingScore"],
        message: `El puntaje mínimo no puede ser mayor al puntaje total posible (${totalScore}).`,
      });
    }
  });

export type TestFormValues = z.infer<typeof testSchema>;
