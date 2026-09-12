"use client";

import {
  Button,
  Card,
  FileInput,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconPhoto, IconUpload } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { AttachmentRecord } from "@/types/resolve-ai";
import {
  attachmentSchema,
  type AttachmentFormValues,
} from "@/schemas/interaction";
import { formatRelative } from "@/lib/occurrence";

/** Galeria das imagens da solicitação e envio de novas (enquanto ativa). */
export function AttachmentsSection({
  attachments,
  canAttach,
  isClosed,
  onUpload,
}: {
  attachments: AttachmentRecord[];
  canAttach: boolean;
  isClosed: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttachmentFormValues>({
    resolver: zodResolver(attachmentSchema),
    defaultValues: { file: null },
  });

  const submit = async (values: AttachmentFormValues) => {
    if (!values.file) return;
    await onUpload(values.file);
    reset({ file: null });
  };

  if (!canAttach && attachments.length === 0) return null;

  return (
    <Card withBorder radius="md">
      <Stack>
        <Title order={2}>Imagens</Title>

        {attachments.length === 0 ? (
          <Text c="dimmed">Nenhuma imagem anexada.</Text>
        ) : (
          <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="sm">
            {attachments.map((attachment) => (
              <Stack key={attachment.id} gap={4}>
                {attachment.url ? (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Image
                      src={attachment.url}
                      alt={`Imagem da solicitação #${attachment.occurrenceId}`}
                      radius="sm"
                      h={140}
                      fit="cover"
                    />
                  </a>
                ) : (
                  <Group gap="xs">
                    <IconPhoto size={16} />
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {attachment.filePath}
                    </Text>
                  </Group>
                )}
                <Text size="xs" c="dimmed">
                  {formatRelative(attachment.createdAt)}
                </Text>
              </Stack>
            ))}
          </SimpleGrid>
        )}

        {canAttach ? (
          <form onSubmit={handleSubmit(submit)} noValidate>
            <Stack gap="sm">
              <Controller
                control={control}
                name="file"
                render={({ field }) => (
                  <FileInput
                    label="Anexar imagem"
                    placeholder="Selecione uma imagem (até 5MB)"
                    accept="image/png,image/jpeg,image/webp"
                    leftSection={<IconUpload size={16} />}
                    clearable
                    error={errors.file?.message}
                    value={field.value ?? null}
                    onChange={field.onChange}
                  />
                )}
              />
              <Button
                type="submit"
                loading={isSubmitting}
                w="fit-content"
                variant="light"
                color="dark"
              >
                Enviar imagem
              </Button>
            </Stack>
          </form>
        ) : (
          isClosed && (
            <Text size="sm" c="dimmed">
              A solicitação está encerrada: novas imagens não são aceitas.
            </Text>
          )
        )}
      </Stack>
    </Card>
  );
}
