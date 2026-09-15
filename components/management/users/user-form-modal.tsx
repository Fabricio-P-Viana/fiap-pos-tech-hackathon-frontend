"use client";

import {
  Button,
  Group,
  Modal,
  PasswordInput,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { UserRecord } from "@/types/resolve-ai";
import {
  createUserSchema,
  editUserSchema,
  type CreateUserFormValues,
  type EditUserFormValues,
} from "@/schemas/user";

const roleOptions = [
  { value: "REQUESTER", label: "Solicitante" },
  { value: "MANAGER", label: "Gestor" },
];

function CreateUserForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (values: CreateUserFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: "onBlur",
    defaultValues: { name: "", email: "", password: "", role: "REQUESTER" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack>
        <TextInput
          label="Nome"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextInput
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Senha"
          error={errors.password?.message}
          {...register("password")}
        />
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select
              label="Perfil"
              data={roleOptions}
              error={errors.role?.message}
              value={field.value}
              onChange={(value) => field.onChange(value ?? field.value)}
            />
          )}
        />
        <Group justify="end">
          <Button variant="subtle" color="dark" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Criar usuário
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

function EditUserForm({
  user,
  onSubmit,
  onCancel,
}: {
  user: UserRecord;
  onSubmit: (values: EditUserFormValues) => Promise<void>;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(editUserSchema),
    mode: "onBlur",
    defaultValues: { name: user.name, email: user.email, password: "" },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack>
        <TextInput
          label="Nome"
          error={errors.name?.message}
          {...register("name")}
        />
        <TextInput
          label="Email"
          type="email"
          error={errors.email?.message}
          {...register("email")}
        />
        <PasswordInput
          label="Nova senha"
          description="Deixe em branco para manter a senha atual."
          error={errors.password?.message}
          {...register("password")}
        />
        <Group justify="end">
          <Button variant="subtle" color="dark" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Salvar alterações
          </Button>
        </Group>
      </Stack>
    </form>
  );
}

export function UserFormModal({
  opened,
  user,
  onClose,
  onCreate,
  onUpdate,
}: {
  opened: boolean;
  user: UserRecord | null;
  onClose: () => void;
  onCreate: (values: CreateUserFormValues) => Promise<void>;
  onUpdate: (user: UserRecord, values: EditUserFormValues) => Promise<void>;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={user ? "Editar usuário" : "Novo usuário"}
      centered
    >
      {user ? (
        <EditUserForm
          key={user.id}
          user={user}
          onCancel={onClose}
          onSubmit={(values) => onUpdate(user, values)}
        />
      ) : (
        <CreateUserForm onCancel={onClose} onSubmit={onCreate} />
      )}
    </Modal>
  );
}
