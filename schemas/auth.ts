import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Informe seu email")
    .email("Informe um email valido"),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .min(6, "A senha precisa ter no minimo 6 caracteres"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Informe seu nome completo")
      .min(3, "Seu nome precisa ter no minimo 3 caracteres"),
    email: z
      .string()
      .trim()
      .min(1, "Informe seu email")
      .email("Informe um email valido"),
    password: z
      .string()
      .min(1, "Informe uma senha")
      .min(6, "A senha precisa ter no minimo 6 caracteres"),
    passwordConfirm: z
      .string()
      .min(1, "Confirme sua senha")
      .min(6, "A confirmacao precisa ter no minimo 6 caracteres"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "As senhas nao conferem",
    path: ["passwordConfirm"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
