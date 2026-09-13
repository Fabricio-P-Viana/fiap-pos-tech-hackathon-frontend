"use client";

import {
  Button,
  Card,
  Group,
  Rating,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { RatingRecord } from "@/types/resolve-ai";
import { ratingSchema, type RatingFormValues } from "@/schemas/interaction";
import { formatRelative } from "@/lib/occurrence";

/**
 * Avaliação do atendimento — a única interação possível depois que a
 * solicitação é resolvida, e apenas para o solicitante.
 */
export function RatingSection({
  rating,
  canRate,
  onSubmit,
}: {
  rating: RatingRecord | null;
  canRate: boolean;
  onSubmit: (values: RatingFormValues) => Promise<void>;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RatingFormValues>({
    resolver: zodResolver(ratingSchema),
    defaultValues: { score: 0, comment: "" },
  });

  return (
    <Card withBorder radius="md">
      <Stack>
        <Title order={2}>Avaliação do atendimento</Title>

        {rating ? (
          <Stack gap={4}>
            <Group gap="sm">
              <Rating value={rating.score} readOnly />
              <Text size="xs" c="dimmed">
                {formatRelative(rating.createdAt)}
              </Text>
            </Group>
            {rating.comment && <Text size="sm">{rating.comment}</Text>}
          </Stack>
        ) : canRate ? (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack gap="sm">
              <Stack gap={2}>
                <Text size="sm" fw={500}>
                  Sua nota
                </Text>
                <Controller
                  control={control}
                  name="score"
                  render={({ field }) => (
                    <Rating
                      size="lg"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
                {errors.score?.message && (
                  <Text size="xs" c="red.7">
                    {errors.score.message}
                  </Text>
                )}
              </Stack>
              <Textarea
                label="Comentário (opcional)"
                placeholder="O que funcionou bem? O que poderia melhorar?"
                autosize
                minRows={2}
                error={errors.comment?.message}
                {...register("comment")}
              />
              <Button type="submit" loading={isSubmitting} w="fit-content">
                Enviar avaliação
              </Button>
            </Stack>
          </form>
        ) : (
          <Text c="dimmed">Aguardando a avaliação do solicitante.</Text>
        )}
      </Stack>
    </Card>
  );
}
