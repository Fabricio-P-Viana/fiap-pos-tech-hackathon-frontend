"use client";

import {
  Alert,
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBan,
  IconCheck,
  IconUserCheck,
} from "@tabler/icons-react";
import { useState } from "react";
import type {
  OccurrencePriority,
  OccurrenceRecord,
  OccurrenceStatus,
  UserRecord,
} from "@/types/resolve-ai";
import { getNextStatuses } from "@/types/resolve-ai";
import { priorityOptions, statusActionLabels } from "@/lib/occurrence";

/**
 * Painel de condução do gestor. A ordem reflete a regra do backend: sem
 * responsável definido nada pode ser movimentado, e só o responsável conduz.
 */
export function ManagerActions({
  occurrence,
  managers,
  currentUserId,
  saving,
  onAssign,
  onStatusChange,
  onPriorityChange,
  onCancelRequest,
}: {
  occurrence: OccurrenceRecord;
  managers: UserRecord[];
  currentUserId?: number;
  saving: boolean;
  onAssign: (assigneeId: number) => Promise<void>;
  onStatusChange: (status: OccurrenceStatus, note?: string) => Promise<void>;
  onPriorityChange: (priority: OccurrencePriority) => Promise<void>;
  onCancelRequest: () => void;
}) {
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState<string | null>(null);

  const hasAssignee = Boolean(occurrence.assigneeId);
  const isAssignee = occurrence.assigneeId === currentUserId;
  const nextStatuses = getNextStatuses(occurrence.status).filter(
    (status) => status !== "CANCELLED",
  );

  const managerOptions = managers.map((manager) => ({
    value: String(manager.id),
    label:
      manager.id === currentUserId ? `${manager.name} (você)` : manager.name,
  }));

  const handleStatus = async (status: OccurrenceStatus) => {
    // Concluir exige a descrição da resolução: ela é gravada na solicitação.
    if (status === "RESOLVED" && !occurrence.resolution && note.trim().length < 10) {
      setNoteError(
        "Descreva como o problema foi resolvido (mínimo de 10 caracteres).",
      );
      return;
    }
    setNoteError(null);
    await onStatusChange(status, note.trim() || undefined);
    setNote("");
  };

  return (
    <Card withBorder radius="md">
      <Stack>
        <Title order={2}>Condução do atendimento</Title>

        {!hasAssignee && (
          <Alert
            color="orange"
            icon={<IconAlertCircle size={18} />}
            title="Defina o responsável"
          >
            A solicitação só pode ser movimentada depois que um gestor for
            definido como responsável — e a partir daí somente ele conduz o
            atendimento.
          </Alert>
        )}

        <Group align="end" gap="sm" wrap="wrap">
          <Select
            label="Gestor responsável"
            placeholder="Selecione um gestor"
            data={managerOptions}
            value={
              occurrence.assigneeId ? String(occurrence.assigneeId) : null
            }
            onChange={(value) => value && void onAssign(Number(value))}
            disabled={saving}
            style={{ flex: "1 1 240px" }}
            searchable
          />
          {!isAssignee && currentUserId && (
            <Button
              variant="light"
              color="dark"
              leftSection={<IconUserCheck size={16} />}
              loading={saving}
              onClick={() => void onAssign(currentUserId)}
            >
              Assumir para mim
            </Button>
          )}
        </Group>

        {hasAssignee && !isAssignee && (
          <Text size="sm" c="dimmed">
            Este atendimento é conduzido por{" "}
            {occurrence.assigneeName ?? `usuário #${occurrence.assigneeId}`}.
            Para movimentá-lo, assuma a responsabilidade.
          </Text>
        )}

        {isAssignee && (
          <>
            <Divider />

            <Select
              label="Prioridade"
              description="Reclassifique quando a urgência mudar."
              data={priorityOptions}
              value={occurrence.priority}
              onChange={(value) =>
                value && void onPriorityChange(value as OccurrencePriority)
              }
              disabled={saving}
              maw={260}
            />

            {nextStatuses.length > 0 && (
              <Stack gap="sm">
                <Textarea
                  label="Observação da decisão"
                  placeholder={
                    nextStatuses.includes("RESOLVED")
                      ? "Obrigatória para concluir — vira o texto de resolução"
                      : "Opcional"
                  }
                  value={note}
                  onChange={(event) => {
                    setNote(event.currentTarget.value);
                    setNoteError(null);
                  }}
                  error={noteError}
                  minRows={2}
                  autosize
                />
                <Group gap="xs">
                  {nextStatuses.map((status) => (
                    <Button
                      key={status}
                      size="sm"
                      variant={status === "RESOLVED" ? "filled" : "light"}
                      color={status === "RESOLVED" ? "teal" : "blue"}
                      leftSection={
                        status === "RESOLVED" ? (
                          <IconCheck size={14} />
                        ) : undefined
                      }
                      loading={saving}
                      onClick={() => void handleStatus(status)}
                    >
                      {statusActionLabels[status]}
                    </Button>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    color="red"
                    leftSection={<IconBan size={14} />}
                    onClick={onCancelRequest}
                  >
                    Cancelar solicitação
                  </Button>
                </Group>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
