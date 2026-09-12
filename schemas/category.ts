import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da categoria")
    .min(3, "O nome precisa ter no mínimo 3 caracteres")
    .max(80, "O nome pode ter no máximo 80 caracteres"),
  description: z
    .string()
    .trim()
    .max(255, "A descrição pode ter no máximo 255 caracteres")
    .optional(),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
