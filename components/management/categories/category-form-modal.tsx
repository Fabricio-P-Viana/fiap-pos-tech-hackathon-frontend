"use client";

import { Button, Group, Modal, Stack, TextInput, Textarea } from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { CategoryRecord } from "@/types/resolve-ai";
import { categorySchema, type CategoryFormValues } from "@/schemas/category";

function CategoryForm({
  category,
  onSubmit,
  onCancel,
}: {
  category: CategoryRecord | null;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    mode: "onBlur",
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack>
        <TextInput
          label="Nome"
          placeholder="Ex.: Elétrica"
          error={errors.name?.message}
          {...register("name")}
        />
        <Textarea
          label="Descrição"
          placeholder="Que tipo de problema entra nesta categoria"
          autosize
          minRows={2}
          error={errors.description?.message}
          {...register("description")}
        />
        <Group justify="end">
          <Button variant="subtle" color="dark" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {category ? "Salvar alterações" : "Criar categoria"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function CategoryFormModal({
  opened,
  category,
  onClose,
  onSubmit,
}: {
  opened: boolean;
  category: CategoryRecord | null;
  onClose: () => void;
  onSubmit: (values: CategoryFormValues) => Promise<void>;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={category ? "Editar categoria" : "Nova categoria"}
      centered
    >
      <CategoryForm
        key={category?.id ?? "new"}
        category={category}
        onCancel={onClose}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
