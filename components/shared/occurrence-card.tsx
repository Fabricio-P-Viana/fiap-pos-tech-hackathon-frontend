import { Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconArrowRight, IconClock, IconMapPin, IconUser } from "@tabler/icons-react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { OccurrenceRecord } from "@/types/resolve-ai";
import { assigneeLabel, formatRelative, requesterLabel } from "@/lib/occurrence";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";

/**
 * Cartão de solicitação reaproveitado pela lista do solicitante, pela fila da
 * gestão e pela home. "showRequester" e "showAssignee" controlam a informação
 * que faz sentido em cada contexto.
 */
export function OccurrenceCard({
  occurrence,
  showRequester = false,
  showAssignee = false,
  footer,
}: {
  occurrence: OccurrenceRecord;
  showRequester?: boolean;
  showAssignee?: boolean;
  footer?: ReactNode;
}) {
  return (
    <Card withBorder radius="md" p="md">
      <Stack gap="xs">
        <Group justify="space-between" align="start" wrap="nowrap">
          <Stack gap={2}>
            <Text fw={700} lineClamp={2}>
              {occurrence.title}
            </Text>
            <Text size="xs" c="dimmed">
              #{occurrence.id}
              {occurrence.categoryName ? ` · ${occurrence.categoryName}` : ""}
            </Text>
          </Stack>
          <StatusBadge status={occurrence.status} />
        </Group>

        <Text size="sm" c="dimmed" lineClamp={2}>
          {occurrence.description}
        </Text>

        <Group gap="xs" wrap="wrap">
          <PriorityBadge priority={occurrence.priority} />
          <Group gap={4} wrap="nowrap">
            <IconClock size={13} opacity={0.6} />
            <Text size="xs" c="dimmed">
              {formatRelative(occurrence.createdAt)}
            </Text>
          </Group>
          {occurrence.locationText && (
            <Group gap={4} wrap="nowrap">
              <IconMapPin size={13} opacity={0.6} />
              <Text size="xs" c="dimmed" lineClamp={1}>
                {occurrence.locationText}
              </Text>
            </Group>
          )}
        </Group>

        {(showRequester || showAssignee) && (
          <Group gap="md" wrap="wrap">
            {showRequester && (
              <Group gap={4} wrap="nowrap">
                <IconUser size={13} opacity={0.6} />
                <Text size="xs" c="dimmed">
                  Solicitante: {requesterLabel(occurrence)}
                </Text>
              </Group>
            )}
            {showAssignee && (
              <Text size="xs" c="dimmed">
                Responsável: {assigneeLabel(occurrence)}
              </Text>
            )}
          </Group>
        )}

        {footer ?? (
          <Button
            component={Link}
            href={`/solicitacoes/${occurrence.id}`}
            size="xs"
            variant="subtle"
            color="dark"
            rightSection={<IconArrowRight size={14} />}
            w="fit-content"
          >
            Ver detalhes
          </Button>
        )}
      </Stack>
    </Card>
  );
}
