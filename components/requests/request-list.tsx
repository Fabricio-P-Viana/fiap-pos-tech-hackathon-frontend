"use client";

import {
  Badge,
  Button,
  Center,
  Container,
  Group,
  Pagination,
  SimpleGrid,
  Stack,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { OccurrenceCard } from "@/components/shared/occurrence-card";
import {
  EmptyState,
  ErrorAlert,
  LoadingState,
} from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { useCurrentUser } from "@/lib/use-current-user";
import { useOccurrenceList } from "@/lib/use-occurrence-list";
import type { OccurrenceStatus } from "@/types/resolve-ai";
import { RequestFilters } from "./request-filters";

/** Lista as solicitações do solicitante (a API já escopa por usuário). */
export function RequestList() {
  const searchParams = useSearchParams();
  const statusFromUrl = searchParams.get("status") as OccurrenceStatus | null;
  // Gestor não abre solicitação: para ele a tela é só de acompanhamento.
  const { isManager } = useCurrentUser();

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
    initialFilters: statusFromUrl ? { status: statusFromUrl } : undefined,
  });

  return (
    <main id="conteudo-principal">
      <Container size="lg" py={{ base: 32, sm: 48 }}>
        <Stack gap="lg">
          <PageHeader
            eyebrow="Área do solicitante"
            title="Minhas solicitações"
            description="Acompanhe o andamento e o histórico de tudo o que você abriu."
            action={
              isManager ? undefined : (
                <Button
                  component={Link}
                  href="/solicitacoes/nova"
                  leftSection={<IconPlus size={16} />}
                >
                  Nova solicitação
                </Button>
              )
            }
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
              description={
                isManager
                  ? "Ajuste os filtros para encontrar solicitações."
                  : "Ajuste os filtros ou abra uma nova solicitação."
              }
              action={
                isManager ? undefined : (
                  <Button
                    component={Link}
                    href="/solicitacoes/nova"
                    size="xs"
                    mt="sm"
                  >
                    Abrir solicitação
                  </Button>
                )
              }
            />
          ) : (
            <Stack gap="md">
              <Group justify="space-between" align="center">
                <Badge variant="light">
                  {total} {total === 1 ? "solicitação" : "solicitações"}
                </Badge>
              </Group>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {occurrences.map((occurrence) => (
                  <OccurrenceCard
                    key={occurrence.id}
                    occurrence={occurrence}
                    showAssignee
                  />
                ))}
              </SimpleGrid>
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
      </Container>
    </main>
  );
}
