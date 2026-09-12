"use client";

import {
  Button,
  Container,
  Grid,
  Group,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconClipboardText,
  IconPlus,
  IconStar,
} from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getOccurrences, getRecentEvents } from "@/services/resolve-ai";
import type {
  OccurrenceEventRecord,
  OccurrenceRecord,
} from "@/types/resolve-ai";
import { isFinalStatus } from "@/types/resolve-ai";
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

/** Resumo da conta do solicitante: números, atalhos e o que mudou. */
export function RequesterHome() {
  const { token, name } = useCurrentUser();
  const [occurrences, setOccurrences] = useState<OccurrenceRecord[]>([]);
  const [events, setEvents] = useState<OccurrenceEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [occurrenceData, eventData] = await Promise.all([
        // A API já limita o solicitante às próprias solicitações.
        getOccurrences(token, { sortBy: "updatedAt", sortOrder: "DESC" }),
        getRecentEvents(token, { limit: 6 }),
      ]);
      setOccurrences(occurrenceData);
      setEvents(eventData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar seu resumo.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState label="Carregando seu resumo..." />;

  const open = occurrences.filter((item) => !isFinalStatus(item.status));
  const resolved = occurrences.filter((item) => item.status === "RESOLVED");
  const awaitingRating = resolved.length;
  const firstName = name?.split(" ")[0];

  return (
    <Container size="lg" py={{ base: 32, sm: 48 }}>
      <Stack gap="xl">
        <PageHeader
          eyebrow="Área do solicitante"
          title={firstName ? `Olá, ${firstName}` : "Olá"}
          description="Acompanhe suas solicitações e abra novas quando precisar."
          action={
            <Button
              component={Link}
              href="/solicitacoes/nova"
              leftSection={<IconPlus size={16} />}
            >
              Nova solicitação
            </Button>
          }
        />

        <ErrorAlert message={error} />

        <SummaryTiles
          tiles={[
            { label: "Em andamento", value: open.length },
            { label: "Resolvidas", value: resolved.length },
            { label: "Total", value: occurrences.length },
            {
              label: "Para avaliar",
              value: awaitingRating,
              hint: awaitingRating ? "Dê sua nota ao atendimento" : undefined,
            },
          ]}
        />

        <Group gap="sm">
          <Button
            component={Link}
            href="/solicitacoes"
            variant="light"
            color="dark"
            leftSection={<IconClipboardText size={16} />}
          >
            Minhas solicitações
          </Button>
          <Button
            component={Link}
            href="/solicitacoes?status=RESOLVED"
            variant="subtle"
            color="dark"
            leftSection={<IconStar size={16} />}
          >
            Resolvidas para avaliar
          </Button>
        </Group>

        <Grid gap="xl">
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Stack gap="sm">
              <Group justify="space-between" align="center">
                <Title order={3}>Em andamento</Title>
                {occurrences.length > 0 && (
                  <Button
                    component={Link}
                    href="/solicitacoes"
                    size="xs"
                    variant="subtle"
                    color="dark"
                    rightSection={<IconArrowRight size={14} />}
                  >
                    Ver todas
                  </Button>
                )}
              </Group>
              {open.length === 0 ? (
                <EmptyState
                  title="Nenhuma solicitação em andamento"
                  description="Quando você abrir uma solicitação ela aparece aqui com o andamento."
                  action={
                    <Button
                      component={Link}
                      href="/solicitacoes/nova"
                      size="xs"
                      mt="sm"
                    >
                      Abrir solicitação
                    </Button>
                  }
                />
              ) : (
                <Stack gap="sm">
                  {open.slice(0, 4).map((occurrence) => (
                    <OccurrenceCard
                      key={occurrence.id}
                      occurrence={occurrence}
                      showAssignee
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 5 }}>
            <RecentActivity events={events} />
          </Grid.Col>
        </Grid>

        {awaitingRating > 0 && (
          <Text size="sm" c="dimmed">
            Você tem {awaitingRating}{" "}
            {awaitingRating === 1 ? "solicitação" : "solicitações"} resolvida
            {awaitingRating === 1 ? "" : "s"} — sua avaliação ajuda a melhorar o
            atendimento.
          </Text>
        )}
      </Stack>
    </Container>
  );
}
