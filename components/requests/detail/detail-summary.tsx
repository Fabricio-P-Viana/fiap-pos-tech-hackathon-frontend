import { Alert, Card, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { IconBan, IconCircleCheck } from "@tabler/icons-react";
import type { OccurrenceRecord } from "@/types/resolve-ai";
import {
  assigneeLabel,
  formatDateTime,
  formatRelative,
  requesterLabel,
} from "@/lib/occurrence";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { StatusBadge } from "@/components/shared/status-badge";

/** Cabeçalho e corpo da solicitação: quem pediu, quem conduz e o desfecho. */
export function DetailSummary({
  occurrence,
  actions,
}: {
  occurrence: OccurrenceRecord;
  actions?: React.ReactNode;
}) {
  return (
    <Stack gap="md">
      <Group justify="space-between" align="start" wrap="wrap" gap="md">
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            Solicitação #{occurrence.id}
            {occurrence.categoryName ? ` · ${occurrence.categoryName}` : ""}
          </Text>
          <Title order={1}>{occurrence.title}</Title>
          <Group gap="xs" wrap="wrap">
            <StatusBadge status={occurrence.status} />
            <PriorityBadge priority={occurrence.priority} />
            <Text size="sm" c="dimmed">
              aberta {formatRelative(occurrence.createdAt)}
            </Text>
          </Group>
        </Stack>
        {actions}
      </Group>

      <Card withBorder radius="md">
        <Stack gap="sm">
          <Group gap="xl" wrap="wrap">
            <Stack gap={0}>
              <Text size="xs" c="dimmed">
                Solicitante
              </Text>
              <Text size="sm" fw={600}>
                {requesterLabel(occurrence)}
              </Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" c="dimmed">
                Responsável
              </Text>
              <Text
                size="sm"
                fw={600}
                c={occurrence.assigneeId ? undefined : "dimmed"}
              >
                {assigneeLabel(occurrence)}
              </Text>
            </Stack>
            <Stack gap={0}>
              <Text size="xs" c="dimmed">
                Aberta em
              </Text>
              <Text size="sm" fw={600}>
                {formatDateTime(occurrence.createdAt)}
              </Text>
            </Stack>
            {occurrence.resolvedAt && (
              <Stack gap={0}>
                <Text size="xs" c="dimmed">
                  Resolvida em
                </Text>
                <Text size="sm" fw={600}>
                  {formatDateTime(occurrence.resolvedAt)}
                </Text>
              </Stack>
            )}
          </Group>

          <Divider />

          <Text style={{ whiteSpace: "pre-line" }}>
            {occurrence.description}
          </Text>

          {(occurrence.locationText || occurrence.locationReference) && (
            <Text size="sm" c="dimmed">
              {occurrence.locationText}
              {occurrence.locationReference
                ? ` — ${occurrence.locationReference}`
                : ""}
            </Text>
          )}
        </Stack>
      </Card>

      {occurrence.status === "RESOLVED" && occurrence.resolution && (
        <Alert
          color="teal"
          title="Resolução"
          icon={<IconCircleCheck size={18} />}
        >
          {occurrence.resolution}
        </Alert>
      )}

      {occurrence.status === "CANCELLED" && (
        <Alert
          color="red"
          title="Motivo do cancelamento"
          icon={<IconBan size={18} />}
        >
          {occurrence.cancellationReason ?? "Motivo não informado."}
        </Alert>
      )}
    </Stack>
  );
}
