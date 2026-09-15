"use client";

import {
  Card,
  Group,
  Rating,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { getDashboardIndicators } from "@/services/resolve-ai";
import type {
  DashboardIndicators,
  OccurrencePriority,
  OccurrenceStatus,
} from "@/types/resolve-ai";
import { priorityLabels, statusLabels } from "@/types/resolve-ai";
import { useCurrentUser } from "@/lib/use-current-user";
import { ErrorAlert, LoadingState } from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { SummaryTiles } from "@/components/home/summary-tiles";
import { BreakdownBars } from "./breakdown-bars";

const statusOrder: OccurrenceStatus[] = [
  "OPEN",
  "IN_ANALYSIS",
  "IN_PROGRESS",
  "RESOLVED",
  "CANCELLED",
];

const priorityOrder: OccurrencePriority[] = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];

function formatHours(hours: number | null): string {
  if (hours == null) return "-";
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} dias`;
}

function pluralize(count: number, singular: string, plural: string) {
  return `${count} ${count === 1 ? singular : plural}`;
}

export function DashboardPanel() {
  const { token } = useCurrentUser();
  const [data, setData] = useState<DashboardIndicators | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const indicators = await getDashboardIndicators(token);
      setData(indicators);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os indicadores.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Carregando indicadores..." />;

  const ratings = data?.ratings;
  const ratingCount = ratings?.count ?? 0;

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Área administrativa"
        title="Dashboard"
        description="Volume da operação e a satisfação declarada pelos solicitantes."
      />

      <ErrorAlert message={error} />

      {data && (
        <>
          <SummaryTiles
            tiles={[
              { label: "Total", value: data.total },
              { label: "Abertas", value: data.open },
              { label: "Em atendimento", value: data.inProgress },
              { label: "Resolvidas", value: data.resolved },
            ]}
          />

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Card withBorder radius="md">
              <Stack gap={6}>
                <Text size="sm" c="dimmed">
                  Nota média
                </Text>
                <Group gap="sm" align="baseline">
                  <Title order={2}>
                    {ratings?.average == null ? "-" : ratings.average.toFixed(1)}
                  </Title>
                  <Text size="sm" c="dimmed">
                    de 5
                  </Text>
                </Group>
                <Rating
                  value={ratings?.average ?? 0}
                  fractions={10}
                  readOnly
                  aria-label={
                    ratings?.average == null
                      ? "Sem avaliações"
                      : `Nota média ${ratings.average.toFixed(1)} de 5`
                  }
                />
                <Text size="xs" c="dimmed">
                  {ratingCount
                    ? pluralize(ratingCount, "avaliação", "avaliações")
                    : "Nenhuma avaliação ainda"}
                </Text>
              </Stack>
            </Card>

            <Card withBorder radius="md">
              <Stack gap={6}>
                <Text size="sm" c="dimmed">
                  Tempo médio de resolução
                </Text>
                <Title order={2}>{formatHours(data.averageResolutionHours)}</Title>
                <Text size="xs" c="dimmed">
                  da abertura até a resolução
                </Text>
              </Stack>
            </Card>

            <Card withBorder radius="md">
              <Stack gap={6}>
                <Text size="sm" c="dimmed">
                  Taxa de avaliação
                </Text>
                <Title order={2}>
                  {data.resolved > 0
                    ? `${Math.round((ratingCount / data.resolved) * 100)}%`
                    : "-"}
                </Title>
                <Text size="xs" c="dimmed">
                  das solicitações resolvidas receberam nota
                </Text>
              </Stack>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Card withBorder radius="md">
              <Stack gap="md">
                <Title order={4}>Distribuição das notas</Title>
                <BreakdownBars
                  total={ratingCount}
                  emptyLabel="Nenhuma avaliação recebida ainda."
                  items={
                    ratingCount === 0
                      ? []
                      : ["5", "4", "3", "2", "1"].map((score) => ({
                          key: score,
                          label: `${score} ${score === "1" ? "estrela" : "estrelas"}`,
                          value: ratings?.distribution[score] ?? 0,
                        }))
                  }
                />
              </Stack>
            </Card>

            <Card withBorder radius="md">
              <Stack gap="md">
                <Title order={4}>Nota média por categoria</Title>
                <BreakdownBars
                  max={5}
                  formatValue={(value) => value.toFixed(1)}
                  emptyLabel="Nenhuma categoria avaliada ainda."
                  items={(ratings?.byCategory ?? []).map((category) => ({
                    key: String(category.categoryId),
                    label: category.categoryName,
                    value: category.average,
                    hint: pluralize(category.count, "nota", "notas"),
                  }))}
                />
              </Stack>
            </Card>
          </SimpleGrid>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
            <Card withBorder radius="md">
              <Stack gap="md">
                <Title order={4}>Por status</Title>
                <BreakdownBars
                  total={data.total}
                  items={statusOrder.map((status) => ({
                    key: status,
                    label: statusLabels[status],
                    value: data.byStatus[status] ?? 0,
                  }))}
                />
              </Stack>
            </Card>

            <Card withBorder radius="md">
              <Stack gap="md">
                <Title order={4}>Por prioridade</Title>
                <BreakdownBars
                  total={data.total}
                  items={priorityOrder.map((priority) => ({
                    key: priority,
                    label: priorityLabels[priority],
                    value: data.byPriority[priority] ?? 0,
                  }))}
                />
              </Stack>
            </Card>

            <Card withBorder radius="md">
              <Stack gap="md">
                <Title order={4}>Por categoria</Title>
                <BreakdownBars
                  total={data.total}
                  items={[...data.byCategory]
                    .sort((a, b) => b.total - a.total)
                    .map((category) => ({
                      key: String(category.categoryId),
                      label: category.categoryName,
                      value: category.total,
                    }))}
                />
              </Stack>
            </Card>
          </SimpleGrid>
        </>
      )}
    </Stack>
  );
}
