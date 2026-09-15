"use client";

import { Group, Progress, Stack, Text, Tooltip } from "@mantine/core";

export type BreakdownItem = {
  key: string;
  label: string;
  value: number;
  hint?: string;
};

export function BreakdownBars({
  items,
  max,
  total,
  formatValue = (value) => String(value),
  emptyLabel = "Sem dados no período.",
}: {
  items: BreakdownItem[];
  max?: number;
  total?: number;
  formatValue?: (value: number) => string;
  emptyLabel?: string;
}) {
  if (items.length === 0)
    return (
      <Text size="sm" c="dimmed">
        {emptyLabel}
      </Text>
    );

  const scale = max ?? Math.max(...items.map((item) => item.value), 1);
  const sum = total ?? items.reduce((acc, item) => acc + item.value, 0);

  return (
    <Stack gap="sm" role="list">
      {items.map((item) => {
        const width = scale > 0 ? (item.value / scale) * 100 : 0;
        const share =
          max === undefined && sum > 0
            ? `${Math.round((item.value / sum) * 100)}% do total`
            : item.hint;

        return (
          <Stack key={item.key} gap={4} role="listitem">
            <Group justify="space-between" gap="xs" wrap="nowrap">
              <Text size="sm" lineClamp={1}>
                {item.label}
              </Text>
              <Group gap={6} wrap="nowrap">
                {item.hint && max !== undefined && (
                  <Text size="xs" c="dimmed">
                    {item.hint}
                  </Text>
                )}
                <Text size="sm" fw={600} ff="var(--font-ibm-plex-mono), monospace">
                  {formatValue(item.value)}
                </Text>
              </Group>
            </Group>
            <Tooltip
              label={`${item.label}: ${formatValue(item.value)}${share ? ` · ${share}` : ""}`}
              withArrow
              openDelay={80}
            >
              <Progress
                value={width}
                color="dark"
                size={8}
                radius="sm"
                aria-hidden
                style={{ cursor: "default" }}
              />
            </Tooltip>
          </Stack>
        );
      })}
    </Stack>
  );
}
