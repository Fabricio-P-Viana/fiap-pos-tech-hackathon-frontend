"use client";

import {
  Badge,
  Center,
  Group,
  Pagination,
  SegmentedControl,
  Stack,
  Text,
} from "@mantine/core";
import { OccurrenceTable } from "@/components/shared/occurrence-table";
import {
  EmptyState,
  ErrorAlert,
  LoadingState,
} from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { RequestFilters } from "@/components/requests/request-filters";
import { useOccurrenceList } from "@/lib/use-occurrence-list";
import type { OccurrenceFilterParams } from "@/types/resolve-ai";

const ASSIGNED_TO_ME: OccurrenceFilterParams = { assigneeId: "me" };

const queueOrders = {
  priority: { sortBy: "priority", sortOrder: "DESC" },
  oldest: { sortBy: "createdAt", sortOrder: "ASC" },
} as const;

type QueueOrder = keyof typeof queueOrders;

export function MyAssignments() {
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
    initialFilters: queueOrders.priority,
    lockedParams: ASSIGNED_TO_ME,
  });

  const currentOrder: QueueOrder =
    filters.sortBy === "createdAt" ? "oldest" : "priority";

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Área administrativa"
        title="Meus atendimentos"
        description="Solicitações sob sua responsabilidade, na ordem em que precisam de atenção."
      />

      <ErrorAlert message={error} />

      <Group justify="space-between" align="end" wrap="wrap" gap="sm">
        <Stack gap={4}>
          <Text size="sm" fw={500}>
            Ordenar fila por
          </Text>
          <SegmentedControl
            color="dark"
            value={currentOrder}
            onChange={(value) =>
              changeFilters({ ...filters, ...queueOrders[value as QueueOrder] })
            }
            data={[
              { value: "priority", label: "Prioridade" },
              { value: "oldest", label: "Tempo de abertura" },
            ]}
          />
        </Stack>
        <Text size="xs" c="dimmed" maw={360}>
          {currentOrder === "priority"
            ? "Mais críticas primeiro; em empate, a aberta há mais tempo vem antes."
            : "As abertas há mais tempo aparecem primeiro."}
        </Text>
      </Group>

      <RequestFilters
        values={filters}
        categories={categories}
        onChange={changeFilters}
        showSort={false}
      />

      {loading ? (
        <LoadingState label="Carregando seus atendimentos..." />
      ) : occurrences.length === 0 ? (
        <EmptyState
          title="Nenhum atendimento sob sua responsabilidade"
          description="Abra uma solicitação na lista geral e assuma o atendimento para que ela apareça aqui."
        />
      ) : (
        <Stack gap="md">
          <Group>
            <Badge variant="light">
              {total} {total === 1 ? "atendimento" : "atendimentos"}
            </Badge>
          </Group>
          <OccurrenceTable occurrences={occurrences} showRequester />
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
