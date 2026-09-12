"use client";

import {
  Button,
  Card,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { CategoryRecord, OccurrenceRecord } from "@/types/resolve-ai";
import {
  editOccurrenceSchema,
  type EditOccurrenceFormValues,
} from "@/schemas/occurrence";
import { priorityOptions } from "@/lib/occurrence";

/**
 * Edição da solicitação. O solicitante altera o conteúdo enquanto está aberta;
 * o gestor responsável também ajusta prioridade e texto de resolução.
 */
export function EditRequestForm({
  occurrence,
  categories,
  isManager,
  onSubmit,
}: {
  occurrence: OccurrenceRecord;
  categories: CategoryRecord[];
  isManager: boolean;
  onSubmit: (values: EditOccurrenceFormValues) => Promise<void>;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditOccurrenceFormValues>({
    resolver: zodResolver(editOccurrenceSchema),
    mode: "onBlur",
    defaultValues: {
      title: occurrence.title,
      description: occurrence.description,
      categoryId: String(occurrence.categoryId),
      locationText: occurrence.locationText ?? "",
      locationReference: occurrence.locationReference ?? "",
      priority: occurrence.priority,
      resolution: occurrence.resolution ?? "",
    },
  });

  return (
    <Card withBorder radius="md">
      <Stack>
        <Stack gap={2}>
          <Title order={2}>Editar solicitação</Title>
          <Text size="sm" c="dimmed">
            {isManager
              ? "Como responsável, você pode ajustar todos os campos enquanto o atendimento estiver em andamento."
              : "Você pode editar título, descrição, categoria e localização enquanto a solicitação estiver aberta."}
          </Text>
        </Stack>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap="sm">
            <TextInput
              label="Título"
              error={errors.title?.message}
              {...register("title")}
            />

            <Textarea
              label="Descrição"
              minRows={3}
              autosize
              error={errors.description?.message}
              {...register("description")}
            />

            <Controller
              control={control}
              name="categoryId"
              render={({ field }) => (
                <Select
                  label="Categoria"
                  data={categories.map((category) => ({
                    value: String(category.id),
                    label: category.name,
                  }))}
                  error={errors.categoryId?.message}
                  value={field.value}
                  onChange={(value) => field.onChange(value ?? field.value)}
                  onBlur={field.onBlur}
                  searchable
                />
              )}
            />

            <TextInput
              label="Local"
              error={errors.locationText?.message}
              {...register("locationText")}
            />

            <TextInput
              label="Referência"
              error={errors.locationReference?.message}
              {...register("locationReference")}
            />

            {isManager && (
              <>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      label="Prioridade"
                      data={priorityOptions}
                      error={errors.priority?.message}
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? field.value)}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <Textarea
                  label="Resolução"
                  placeholder="Como o problema foi ou está sendo resolvido"
                  minRows={2}
                  autosize
                  error={errors.resolution?.message}
                  {...register("resolution")}
                />
              </>
            )}

            <Button type="submit" loading={isSubmitting} w="fit-content">
              Salvar alterações
            </Button>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}
