"use client";

import { Badge, Center, Group, Pagination, Stack } from "@mantine/core";
import { useSearchParams } from "next/navigation";
import type { OccurrenceStatus } from "@/types/resolve-ai";
import { useOccurrenceList } from "@/lib/use-occurrence-list";
import { OccurrenceTable } from "@/components/shared/occurrence-table";
import {
  EmptyState,
  ErrorAlert,
  LoadingState,
} from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { RequestFilters } from "@/components/requests/request-filters";

export function ManagementRequestList() {
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get("status") as OccurrenceStatus | null;

  const {
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
  } = useOccurrenceList({
    initialFilters: {
      sortBy: "priority",
      sortOrder: "DESC",
      ...(statusFromUrl ? { status: statusFromUrl } : {}),
    },
  });

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Área administrativa"
        title="Solicitações"
        description="Todas as solicitações da operação. Abra uma solicitação para definir o responsável e conduzir o atendimento."
      />

      <ErrorAlert message={error} />

      <RequestFilters
        values={filters}
        categories={categories}
        onChange={changeFilters}
      />

      {loading ? (
        <LoadingState label="Carregando solicitações..." />
      ) : occurrences.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação encontrada"
          description="Ajuste os filtros para ver outras solicitações."
        />
      ) : (
        <Stack gap="md">
          <Group>
            <Badge variant="light">
              {total} {total === 1 ? "solicitação" : "solicitações"}
            </Badge>
          </Group>
          <OccurrenceTable
            occurrences={occurrences}
            showRequester
            showAssignee
          />
          {totalPages > 1 && (
            <Center>
              <Pagination
                total={totalPages}
                value={page}
                onChange={setPage}
                color="dark"
              />
            </Center>
          )}
        </Stack>
      )}
    </Stack>
  );
}
