"use client";

import { Button, Container, Grid, Group, Stack, Title } from "@mantine/core";
import {
  IconArrowRight,
  IconChartBar,
  IconInbox,
  IconUserCheck,
} from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  getDashboardIndicators,
  getOccurrences,
  getRecentEvents,
} from "@/services/resolve-ai";
import type {
  DashboardIndicators,
  OccurrenceEventRecord,
  OccurrenceRecord,
} from "@/types/resolve-ai";
import { useCurrentUser } from "@/lib/use-current-user";
import { OccurrenceCard } from "@/components/shared/occurrence-card";
import {
  EmptyState,
  ErrorAlert,
  LoadingState,
} from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { RecentActivity } from "./recent-activity";
import { SummaryTiles } from "./summary-tiles";

/** Resumo da operação para o gestor: indicadores, fila e movimento recente. */
export function ManagerHome() {
  const { token, name } = useCurrentUser();
  const [indicators, setIndicators] = useState<DashboardIndicators | null>(
    null,
  );
  const [unassigned, setUnassigned] = useState<OccurrenceRecord[]>([]);
  const [mine, setMine] = useState<OccurrenceRecord[]>([]);
  const [events, setEvents] = useState<OccurrenceEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [indicatorData, queueData, mineData, eventData] = await Promise.all(
        [
          getDashboardIndicators(token),
          getOccurrences(token, {
            status: "OPEN",
            sortBy: "priority",
            sortOrder: "DESC",
            limit: 20,
          }),
          getOccurrences(token, {
            assigneeId: "me",
            sortBy: "priority",
            sortOrder: "DESC",
            limit: 20,
          }),
          getRecentEvents(token, { limit: 6 }),
        ],
      );
      setIndicators(indicatorData);
      // Sem responsável definido nada pode ser conduzido: é a fila de entrada.
      setUnassigned(queueData.filter((item) => !item.assigneeId));
      setMine(mineData.filter((item) => item.status !== "RESOLVED"));
      setEvents(eventData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o resumo da operação.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Carregando o resumo..." />;

  const firstName = name?.split(" ")[0];
  const average = indicators?.ratings?.average;

  return (
    <Container size="lg" py={{ base: 32, sm: 48 }}>
      <Stack gap="xl">
        <PageHeader
          eyebrow="Área administrativa"
          title={firstName ? `Olá, ${firstName}` : "Central de gestão"}
          description="Visão geral da operação e dos atendimentos sob sua responsabilidade."
          action={
            <Button
              component={Link}
              href="/gestao/meus-atendimentos"
              leftSection={<IconUserCheck size={16} />}
            >
              Meus atendimentos
            </Button>
          }
        />

        <ErrorAlert message={error} />

        <SummaryTiles
          tiles={[
            {
              label: "Abertas",
              value: indicators?.open ?? 0,
              hint: "últimos 30 dias",
            },
            {
              label: "Em atendimento",
              value: indicators?.inProgress ?? 0,
              hint: "últimos 30 dias",
            },
            {
              label: "Sob minha responsabilidade",
              value: mine.length,
            },
            {
              label: "Nota média",
              value: average == null ? "-" : average.toFixed(1),
              hint: indicators?.ratings?.count
                ? `${indicators.ratings.count} ${indicators.ratings.count === 1 ? "avaliação" : "avaliações"} em 30 dias`
                : "sem avaliações em 30 dias",
            },
          ]}
        />

        <Group gap="sm">
          <Button
            component={Link}
            href="/gestao/solicitacoes"
            variant="light"
            color="dark"
            leftSection={<IconInbox size={16} />}
          >
            Todas as solicitações
          </Button>
          <Button
            component={Link}
            href="/gestao/dashboard"
            variant="subtle"
            color="dark"
            leftSection={<IconChartBar size={16} />}
          >
            Indicadores
          </Button>
        </Group>

        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="lg">
              <Stack gap="sm">
                <Group justify="space-between" align="center">
                  <Title order={3}>Aguardando responsável</Title>
                  <Button
                    component={Link}
                    href="/gestao/solicitacoes?status=OPEN"
                    size="xs"
                    variant="subtle"
                    color="dark"
                    rightSection={<IconArrowRight size={14} />}
                  >
                    Ver fila
                  </Button>
                </Group>
                {unassigned.length === 0 ? (
                  <EmptyState
                    title="Nenhuma solicitação sem responsável"
                    description="Toda solicitação aberta já tem um gestor definido."
                  />
                ) : (
                  <Stack gap="sm">
                    {unassigned.slice(0, 3).map((occurrence) => (
                      <OccurrenceCard
                        key={occurrence.id}
                        occurrence={occurrence}
                        showRequester
                      />
                    ))}
                  </Stack>
                )}
              </Stack>

              <Stack gap="sm">
                <Title order={3}>Meus atendimentos por prioridade</Title>
                {mine.length === 0 ? (
                  <EmptyState
                    title="Você não conduz nenhum atendimento"
                    description="Assuma uma solicitação da fila para começar."
                  />
                ) : (
                  <Stack gap="sm">
                    {mine.slice(0, 3).map((occurrence) => (
                      <OccurrenceCard
                        key={occurrence.id}
                        occurrence={occurrence}
                        showRequester
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <RecentActivity events={events} title="Movimento recente" />
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  );
}
