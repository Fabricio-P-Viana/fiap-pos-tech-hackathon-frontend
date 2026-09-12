import { z } from "zod";

const name = z
  .string()
  .trim()
  .min(1, "Informe o nome completo")
  .min(3, "O nome precisa ter no mínimo 3 caracteres");

const email = z
  .string()
  .trim()
  .min(1, "Informe o email")
  .email("Informe um email válido");

export const createUserSchema = z.object({
  name,
  email,
  password: z
    .string()
    .min(1, "Informe uma senha")
    .min(6, "A senha precisa ter no mínimo 6 caracteres"),
  role: z.enum(["REQUESTER", "MANAGER"], {
    message: "Selecione um perfil",
  }),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;

/**
 * Na edição a senha é opcional: vazio significa "manter a senha atual".
 */
export const editUserSchema = z.object({
  name,
  email,
  password: z
    .string()
    .refine((value) => value.length === 0 || value.length >= 6, {
      message: "A nova senha precisa ter no mínimo 6 caracteres",
    })
    .optional(),
});

export type EditUserFormValues = z.infer<typeof editUserSchema>;
