import { z } from "zod";
import { paginationSchema } from "./common.schema";

export const documentCreateSchema = z.object({
  name: z.string().trim().min(1, "O campo nome é obrigatório"),
  description: z.string().trim().min(1, "O campo descrição é obrigatório"),
});

export const documentUpdateSchema = z.object({
  name: z.string().trim().min(1, "O campo nome é obrigatório").optional(),
  description: z
    .string()
    .trim()
    .min(1, "O campo descrição é obrigatório")
    .optional(),
});

export const documentSearchQuerySchema = paginationSchema;
