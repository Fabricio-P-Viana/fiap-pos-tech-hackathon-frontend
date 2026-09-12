import { z } from "zod";

export const commentSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Escreva o comentário")
    .min(3, "O comentário precisa ter no mínimo 3 caracteres")
    .max(2000, "O comentário pode ter no máximo 2000 caracteres"),
  isInternal: z.boolean().optional(),
});

export type CommentFormValues = z.infer<typeof commentSchema>;

export const ratingSchema = z.object({
  score: z
    .number({ message: "Selecione uma nota" })
    .int("Selecione uma nota")
    .min(1, "Selecione de 1 a 5 estrelas")
    .max(5, "Selecione de 1 a 5 estrelas"),
  comment: z
    .string()
    .trim()
    .max(1000, "O comentário pode ter no máximo 1000 caracteres")
    .optional(),
});

export type RatingFormValues = z.infer<typeof ratingSchema>;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const attachmentSchema = z.object({
  file: z
    .custom<File | null>((value) => value instanceof File, {
      message: "Selecione uma imagem",
    })
    .refine((file) => !file || file.size <= MAX_IMAGE_BYTES, {
      message: "A imagem precisa ter no máximo 5MB",
    })
    .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "Envie uma imagem JPEG, PNG ou WebP",
    }),
});

export type AttachmentFormValues = z.infer<typeof attachmentSchema>;
