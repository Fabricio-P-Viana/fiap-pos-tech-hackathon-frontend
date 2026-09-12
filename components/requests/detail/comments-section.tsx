"use client";

import {
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { IconLock, IconSend } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { CommentRecord } from "@/types/resolve-ai";
import { commentSchema, type CommentFormValues } from "@/schemas/interaction";
import { authorLabel, formatRelative } from "@/lib/occurrence";

export function CommentsSection({
  comments,
  canComment,
  isManager,
  isClosed,
  onSubmit,
}: {
  comments: CommentRecord[];
  canComment: boolean;
  isManager: boolean;
  isClosed: boolean;
  onSubmit: (values: CommentFormValues) => Promise<void>;
}) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: { body: "", isInternal: false },
  });

  const submit = async (values: CommentFormValues) => {
    await onSubmit(values);
    reset({ body: "", isInternal: false });
  };

  return (
    <Card withBorder radius="md">
      <Stack>
        <Group justify="space-between" align="center">
          <Title order={2}>Comentários</Title>
          <Badge variant="light">{comments.length}</Badge>
        </Group>

        {comments.length === 0 && (
          <Text c="dimmed">Ainda não há comentários.</Text>
        )}

        <Stack gap="sm">
          {comments.map((comment) => (
            <Stack key={comment.id} gap={4}>
              <Group gap="xs" wrap="wrap">
                <Text fw={600} size="sm">
                  {authorLabel(comment.authorName, comment.authorId)}
                </Text>
                {comment.isInternal && (
                  <Badge
                    size="xs"
                    color="grape"
                    leftSection={<IconLock size={10} />}
                  >
                    Interno
                  </Badge>
                )}
                <Text size="xs" c="dimmed">
                  {formatRelative(comment.createdAt)}
                </Text>
              </Group>
              <Text size="sm" style={{ whiteSpace: "pre-line" }}>
                {comment.body}
              </Text>
              <Divider />
            </Stack>
          ))}
        </Stack>

        {canComment ? (
          <form onSubmit={handleSubmit(submit)} noValidate>
            <Stack gap="sm">
              <Textarea
                label="Adicionar comentário"
                placeholder="Escreva uma atualização"
                minRows={3}
                autosize
                error={errors.body?.message}
                {...register("body")}
              />
              {isManager && (
                <Controller
                  control={control}
                  name="isInternal"
                  render={({ field }) => (
                    <Checkbox
                      label="Comentário interno (visível apenas para gestores)"
                      checked={Boolean(field.value)}
                      onChange={(event) =>
                        field.onChange(event.currentTarget.checked)
                      }
                    />
                  )}
                />
              )}
              <Button
                type="submit"
                leftSection={<IconSend size={16} />}
                loading={isSubmitting}
                w="fit-content"
              >
                Comentar
              </Button>
            </Stack>
          </form>
        ) : (
          isClosed && (
            <Text size="sm" c="dimmed">
              A solicitação está encerrada e serve como histórico: novos
              comentários não são aceitos.
            </Text>
          )
        )}
      </Stack>
    </Card>
  );
}
