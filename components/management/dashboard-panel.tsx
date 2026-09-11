"use client";

import {
  Badge,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useCallback, useEffect, useState } from "react";
import { getDashboardIndicators } from "@/services/resolve-ai";
import type { DashboardIndicators } from "@/types/resolve-ai";
import { priorityLabels, statusLabels } from "@/types/resolve-ai";

export function DashboardPanel({
  token,
  onError,
}: {
  token?: string;
  onError: (message: string) => void;
}) {
  const [data, setData] = useState<DashboardIndicators | null>(null);
  const load = useCallback(async () => {
    if (!token) return;
    try {
      setData(await getDashboardIndicators(token));
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os indicadores.",
      );
    }
  }, [onError, token]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (!data) return <Text c="dimmed">Carregando indicadores...</Text>;
  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <div>
          <Title order={3}>Indicadores</Title>
          <Text size="sm" c="dimmed">
            Visão geral da operação.
          </Text>
        </div>
        <Badge variant="light">{data.total} solicitações</Badge>
      </Group>
      <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            Abertas
          </Text>
          <Title order={2}>{data.open}</Title>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            Em atendimento
          </Text>
          <Title order={2}>{data.inProgress}</Title>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            Resolvidas
          </Text>
          <Title order={2}>{data.resolved}</Title>
        </Card>
        <Card withBorder>
          <Text size="sm" c="dimmed">
            Tempo médio
          </Text>
          <Title order={2}>
            {data.averageResolutionHours == null
              ? "-"
              : `${data.averageResolutionHours}h`}
          </Title>
        </Card>
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Card withBorder>
          <Title order={4}>Por status</Title>
          <Stack mt="md">
            {Object.entries(data.byStatus).map(([key, value]) => (
              <Group key={key} justify="space-between">
                <Text>
                  {statusLabels[key as keyof typeof statusLabels] ?? key}
                </Text>
                <Badge>{value}</Badge>
              </Group>
            ))}
          </Stack>
        </Card>
        <Card withBorder>
          <Title order={4}>Por prioridade</Title>
          <Stack mt="md">
            {Object.entries(data.byPriority).map(([key, value]) => (
              <Group key={key} justify="space-between">
                <Text>
                  {priorityLabels[key as keyof typeof priorityLabels] ?? key}
                </Text>
                <Badge>{value}</Badge>
              </Group>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>
      <Card withBorder>
        <Title order={4}>Por categoria</Title>
        <Stack mt="md">
          {data.byCategory.map((category) => (
            <Group key={category.categoryId} justify="space-between">
              <Text>{category.categoryName}</Text>
              <Badge>{category.total}</Badge>
            </Group>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
