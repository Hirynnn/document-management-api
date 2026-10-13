import { z } from "zod";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("Informe um e-mail válido"),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)/,
      "A senha deve conter pelo menos uma letra maiúscula e um número",
    ),
  role: z
    .enum(["USER", "ADMIN"], {
      errorMap: () => ({
        message: "O papel do usuário deve ser USER ou ADMIN",
      }),
    })
    .optional()
    .default("USER"),
  active: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres")
    .optional(),
  email: z.string().trim().email("Informe um e-mail válido").optional(),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)/,
      "A senha deve conter pelo menos uma letra maiúscula e um número",
    )
    .optional(),
  role: z
    .enum(["USER", "ADMIN"], {
      errorMap: () => ({
        message: "O papel do usuário deve ser USER ou ADMIN",
      }),
    })
    .optional(),
  active: z.boolean().optional(),
});
