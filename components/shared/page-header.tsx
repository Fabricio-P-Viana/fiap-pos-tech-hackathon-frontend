import { Group, Stack, Text, Title } from "@mantine/core";
import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Group justify="space-between" align="end" wrap="wrap" gap="md">
      <Stack gap={4} maw={680}>
        {eyebrow && <Text className="eyebrow">{eyebrow}</Text>}
        <Title order={1}>{title}</Title>
        {description && <Text c="dimmed">{description}</Text>}
      </Stack>
      {action}
    </Group>
  );
}
