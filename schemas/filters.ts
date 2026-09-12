import { z } from "zod";

/**
 * Filtros da listagem. Todos opcionais e representados como string porque vêm
 * de selects/inputs; a conversão para o formato da API fica no serviço.
 */
export const occurrenceFiltersSchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z
    .enum(["OPEN", "IN_ANALYSIS", "IN_PROGRESS", "RESOLVED", "CANCELLED"])
    .nullable()
    .optional(),
  priority: z
    .enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
    .nullable()
    .optional(),
  categoryId: z.string().nullable().optional(),
  sortBy: z
    .enum(["createdAt", "updatedAt", "priority", "status"])
    .nullable()
    .optional(),
  sortOrder: z.enum(["ASC", "DESC"]).nullable().optional(),
});

export type OccurrenceFiltersValues = z.infer<typeof occurrenceFiltersSchema>;

export const emptyOccurrenceFilters: OccurrenceFiltersValues = {
  search: "",
  status: null,
  priority: null,
  categoryId: null,
  sortBy: "createdAt",
  sortOrder: "DESC",
};
