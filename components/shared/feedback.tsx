"use client";

import { Alert, Card, Center, Loader, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconInbox } from "@tabler/icons-react";
import type { ReactNode } from "react";

export function ErrorAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert
      icon={<IconAlertCircle size={18} />}
      color="red"
      title="Atenção"
      role="alert"
    >
      {message}
    </Alert>
  );
}

export function NoticeAlert({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <Alert color="teal" title="Tudo certo" role="status">
      {message}
    </Alert>
  );
}

export function LoadingState({ label = "Carregando..." }: { label?: string }) {
  return (
    <Center mih="40vh">
      <Stack align="center" gap="sm">
        <Loader color="dark" />
        <Text c="dimmed" size="sm">
          {label}
        </Text>
      </Stack>
    </Center>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Card withBorder radius="md" p="xl">
      <Stack align="center" gap="xs">
        <IconInbox size={28} opacity={0.5} />
        <Text fw={600}>{title}</Text>
        {description && (
          <Text size="sm" c="dimmed" ta="center" maw={420}>
            {description}
          </Text>
        )}
        {action}
      </Stack>
    </Card>
  );
}
