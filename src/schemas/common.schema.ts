import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().trim().min(1, "O identificador do registro é obrigatório"),
});

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int("A página deve ser um número inteiro")
    .min(1, "A página deve ser maior que zero")
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int("O limite deve ser um número inteiro")
    .min(1, "O limite deve ser maior que zero")
    .max(100, "O limite máximo é 100")
    .optional()
    .default(10),
  search: z.string().trim().optional(),
});

export const searchSchema = z.object({
  search: z.string().trim().optional(),
});
