"use client";

import { Anchor, Stack, Text, Timeline } from "@mantine/core";
import {
  IconCheck,
  IconBan,
  IconFlag,
  IconPlus,
  IconUserCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import type { OccurrenceEventRecord } from "@/types/resolve-ai";
import { describeEvent, formatRelative, statusColors } from "@/lib/occurrence";

const COLLAPSED_COUNT = 4;

function iconFor(type: OccurrenceEventRecord["type"], newValue?: string | null) {
  if (type === "CREATED") return <IconPlus size={12} />;
  if (type === "ASSIGNEE_CHANGED") return <IconUserCheck size={12} />;
  if (type === "PRIORITY_CHANGED") return <IconFlag size={12} />;
  if (newValue === "RESOLVED") return <IconCheck size={12} />;
  if (newValue === "CANCELLED") return <IconBan size={12} />;
  return undefined;
}

/**
 * Linha do tempo resumida: mostra os eventos mais recentes e esconde o resto
 * atrás de um "ver histórico completo", já com os textos traduzidos.
 */
export function OccurrenceTimeline({
  events,
}: {
  events: OccurrenceEventRecord[];
}) {
  const [expanded, setExpanded] = useState(false);

  if (events.length === 0)
    return <Text c="dimmed">Nenhum acontecimento registrado ainda.</Text>;

  // Do mais recente para o mais antigo: é o que interessa primeiro.
  const ordered = [...events].reverse();
  const hidden = Math.max(ordered.length - COLLAPSED_COUNT, 0);
  const visible = expanded ? ordered : ordered.slice(0, COLLAPSED_COUNT);

  return (
    <Stack gap="sm">
      <Timeline active={0} bulletSize={22} lineWidth={2}>
        {visible.map((event) => {
          const entry = describeEvent(event);
          return (
            <Timeline.Item
              key={entry.id}
              title={entry.title}
              bullet={iconFor(event.type, event.newValue)}
              color={entry.status ? statusColors[entry.status] : "gray"}
            >
              {entry.detail && (
                <Text size="sm" mb={2}>
                  {entry.detail}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                {entry.actor} · {formatRelative(entry.createdAt)}
              </Text>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {hidden > 0 && (
        <Anchor
          component="button"
          type="button"
          size="sm"
          c="dimmed"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded
            ? "Mostrar apenas os recentes"
            : `Ver histórico completo (${hidden} ${hidden === 1 ? "evento" : "eventos"})`}
        </Anchor>
      )}
    </Stack>
  );
}
