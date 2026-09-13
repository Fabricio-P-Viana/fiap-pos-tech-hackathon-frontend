"use client";

import { Button, Group, Modal, Stack, Text, Textarea } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  cancelOccurrenceSchema,
  type CancelOccurrenceFormValues,
} from "@/schemas/occurrence";

/**
 * Cancelar exige motivo: a solicitação não é excluída, fica no histórico com a
 * explicação registrada.
 */
export function CancelRequestModal({
  opened,
  occurrenceId,
  onClose,
  onConfirm,
}: {
  opened: boolean;
  occurrenceId: number;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CancelOccurrenceFormValues>({
    resolver: zodResolver(cancelOccurrenceSchema),
    defaultValues: { cancellationReason: "" },
  });

  const close = () => {
    reset({ cancellationReason: "" });
    onClose();
  };

  const submit = async (values: CancelOccurrenceFormValues) => {
    await onConfirm(values.cancellationReason);
    reset({ cancellationReason: "" });
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={`Cancelar a solicitação #${occurrenceId}`}
      centered
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        <Stack>
          <Text size="sm" c="dimmed">
            A solicitação continua registrada como histórico. Explique o motivo
            do cancelamento para quem acompanha.
          </Text>
          <Textarea
            label="Motivo do cancelamento"
            placeholder="Ex.: duplicada da solicitação #12"
            minRows={3}
            autosize
            error={errors.cancellationReason?.message}
            {...register("cancellationReason")}
          />
          <Group justify="end">
            <Button variant="subtle" color="dark" onClick={close}>
              Voltar
            </Button>
            <Button type="submit" color="red" loading={isSubmitting}>
              Cancelar solicitação
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
