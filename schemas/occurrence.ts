import { z } from "zod";
import type { OccurrencePriority } from "@/types/resolve-ai";

const priorityValues = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

const title = z
  .string()
  .trim()
  .min(1, "Informe um título")
  .min(5, "O título precisa ter no mínimo 5 caracteres")
  .max(120, "O título pode ter no máximo 120 caracteres");

const description = z
  .string()
  .trim()
  .min(1, "Descreva o que aconteceu")
  .min(15, "Descreva com mais detalhes (mínimo de 15 caracteres)");

const locationText = z
  .string()
  .trim()
  .max(160, "O local pode ter no máximo 160 caracteres")
  .optional();

const locationReference = z
  .string()
  .trim()
  .max(160, "A referência pode ter no máximo 160 caracteres")
  .optional();

/** O select do Mantine trabalha com string; a conversão para número é aqui. */
const categoryId = z
  .string()
  .min(1, "Selecione uma categoria")
  .refine((value) => Number.isInteger(Number(value)) && Number(value) > 0, {
    message: "Selecione uma categoria válida",
  });

const priority = z.enum(priorityValues, {
  message: "Selecione uma prioridade",
});

/** Aceita apenas imagens até 5MB, o mesmo limite validado pelo backend. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const photo = z
  .custom<File | null>((value) => value === null || value instanceof File, {
    message: "Anexo inválido",
  })
  .refine((file) => !file || file.size <= MAX_IMAGE_BYTES, {
    message: "A imagem precisa ter no máximo 5MB",
  })
  .refine((file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type), {
    message: "Envie uma imagem JPEG, PNG ou WebP",
  })
  .optional()
  .nullable();

export const createOccurrenceSchema = z.object({
  categoryId,
  title,
  description,
  priority,
  locationText,
  locationReference,
  photo,
});

export type CreateOccurrenceFormValues = z.infer<
  typeof createOccurrenceSchema
>;

/**
 * Edição da solicitação. Prioridade e resolução são opcionais porque só o
 * gestor responsável vê esses campos — o solicitante edita apenas o conteúdo.
 */
export const editOccurrenceSchema = z.object({
  categoryId,
  title,
  description,
  locationText,
  locationReference,
  priority: priority.optional(),
  resolution: z
    .string()
    .trim()
    .max(2000, "A resolução pode ter no máximo 2000 caracteres")
    .optional(),
});

export type EditOccurrenceFormValues = z.infer<typeof editOccurrenceSchema>;

export const priorityChangeSchema = z.object({
  priority,
});

export type PriorityChangeFormValues = z.infer<typeof priorityChangeSchema>;

export const assignOccurrenceSchema = z.object({
  assigneeId: z.string().min(1, "Selecione o gestor responsável"),
});

export type AssignOccurrenceFormValues = z.infer<
  typeof assignOccurrenceSchema
>;

/**
 * Nota da decisão de status. Concluir exige o texto porque ele se torna a
 * resolução registrada na solicitação.
 */
export const statusChangeSchema = z.object({
  note: z.string().trim().optional(),
});

export type StatusChangeFormValues = z.infer<typeof statusChangeSchema>;

export const resolveOccurrenceSchema = z.object({
  note: z
    .string()
    .trim()
    .min(1, "Descreva como o problema foi resolvido")
    .min(10, "Descreva a resolução com mais detalhes"),
});

export type ResolveOccurrenceFormValues = z.infer<
  typeof resolveOccurrenceSchema
>;

/** O motivo do cancelamento é obrigatório: a solicitação fica no histórico. */
export const cancelOccurrenceSchema = z.object({
  cancellationReason: z
    .string()
    .trim()
    .min(1, "Informe o motivo do cancelamento")
    .min(10, "Explique o motivo com mais detalhes"),
});

export type CancelOccurrenceFormValues = z.infer<
  typeof cancelOccurrenceSchema
>;

export function toPriority(value: string): OccurrencePriority {
  return priority.parse(value);
}
