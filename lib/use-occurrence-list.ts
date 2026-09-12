"use client";

import { useCallback, useEffect, useState } from "react";
import { getCategories, getOccurrencesPaginated } from "@/services/resolve-ai";
import type {
  CategoryRecord,
  OccurrenceFilterParams,
  OccurrenceRecord,
} from "@/types/resolve-ai";
import {
  emptyOccurrenceFilters,
  type OccurrenceFiltersValues,
} from "@/schemas/filters";
import { useCurrentUser } from "./use-current-user";

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 400;

/**
 * Estado compartilhado das listagens de solicitação: filtros, paginação e
 * carregamento. A filtragem e a ordenação são feitas pela API — o cliente só
 * traduz os campos do formulário em parâmetros de consulta.
 */
export function useOccurrenceList(options?: {
  initialFilters?: Partial<OccurrenceFiltersValues>;
  /** Filtros fixos da tela, como "somente os meus atendimentos". */
  lockedParams?: OccurrenceFilterParams;
}) {
  const { token } = useCurrentUser();
  const [filters, setFilters] = useState<OccurrenceFiltersValues>({
    ...emptyOccurrenceFilters,
    ...options?.initialFilters,
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search ?? "");
  const [occurrences, setOccurrences] = useState<OccurrenceRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Evita uma consulta por tecla digitada na busca.
  useEffect(() => {
    const timer = window.setTimeout(
      () => setDebouncedSearch(filters.search?.trim() ?? ""),
      SEARCH_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    if (!token) return;
    getCategories(token)
      .then(setCategories)
      .catch(() => undefined);
  }, [token]);

  const lockedParams = options?.lockedParams;

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const result = await getOccurrencesPaginated(token, {
        ...lockedParams,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.categoryId
          ? { categoryId: Number(filters.categoryId) }
          : {}),
        ...(filters.sortBy ? { sortBy: filters.sortBy } : {}),
        ...(filters.sortOrder ? { sortOrder: filters.sortOrder } : {}),
        page,
        limit: PAGE_SIZE,
      });
      setOccurrences(result.data);
      setTotalPages(result.totalPages);
      setTotal(result.total);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as solicitações.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    filters.categoryId,
    filters.priority,
    filters.sortBy,
    filters.sortOrder,
    filters.status,
    lockedParams,
    page,
    token,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Trocar de filtro reinicia a paginação para não cair em página vazia. */
  const changeFilters = useCallback((next: OccurrenceFiltersValues) => {
    setFilters(next);
    setPage(1);
  }, []);

  return {
    filters,
    changeFilters,
    categories,
    occurrences,
    page,
    setPage,
    totalPages,
    total,
    loading,
    error,
    setError,
    reload: load,
  };
}
