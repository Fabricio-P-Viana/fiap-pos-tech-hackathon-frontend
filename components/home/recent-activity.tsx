import { Card, Group, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";
import type { OccurrenceEventRecord } from "@/types/resolve-ai";
import { describeEvent, formatRelative } from "@/lib/occurrence";
import { EmptyState } from "@/components/shared/feedback";

/** Últimos acontecimentos, já traduzidos, com link para a solicitação. */
export function RecentActivity({
  events,
  title = "Últimos acontecimentos",
}: {
  events: OccurrenceEventRecord[];
  title?: string;
}) {
  return (
    <Stack gap="sm">
      <Title order={3}>{title}</Title>
      {events.length === 0 ? (
        <EmptyState
          title="Nada por aqui ainda"
          description="As atualizações das solicitações aparecem nesta lista."
        />
      ) : (
        <Stack gap="xs">
          {events.map((event) => {
            const entry = describeEvent(event);
            return (
              <Card
                key={entry.id}
                withBorder
                radius="md"
                p="sm"
                component={Link}
                href={`/solicitacoes/${event.occurrenceId}`}
              >
                <Group justify="space-between" align="start" wrap="nowrap">
                  <Stack gap={2}>
                    <Text size="sm" fw={600}>
                      {entry.title}
                    </Text>
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      #{event.occurrenceId}
                      {event.occurrenceTitle
                        ? ` · ${event.occurrenceTitle}`
                        : ""}{" "}
                      · {entry.actor}
                    </Text>
                  </Stack>
                  <Text size="xs" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                    {formatRelative(entry.createdAt)}
                  </Text>
                </Group>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
