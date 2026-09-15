"use client";

import {
  Badge,
  Button,
  Card,
  Group,
  Stack,
  Table,
  Text,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from "@/services/resolve-ai";
import type { UserRecord } from "@/types/resolve-ai";
import type {
  CreateUserFormValues,
  EditUserFormValues,
} from "@/schemas/user";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  EmptyState,
  ErrorAlert,
  LoadingState,
  NoticeAlert,
} from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { UserFormModal } from "./user-form-modal";

export function UsersPanel() {
  const { token, userId } = useCurrentUser();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setUsers(await getUsers(token));
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar os usuários.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const openForm = (user: UserRecord | null) => {
    setEditing(user);
    setModalOpen(true);
  };

  const handleCreate = async (values: CreateUserFormValues) => {
    if (!token) return;
    try {
      await createUser(
        token,
        { name: values.name, email: values.email, password: values.password },
        values.role,
      );
      setModalOpen(false);
      setNotice("Usuário criado.");
      setError(null);
      await load();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar o usuário.",
      );
    }
  };

  const handleUpdate = async (user: UserRecord, values: EditUserFormValues) => {
    if (!token) return;
    try {
      await updateUser(token, user.id, {
        name: values.name,
        email: values.email,
        ...(values.password ? { password: values.password } : {}),
      });
      setModalOpen(false);
      setNotice("Usuário atualizado.");
      setError(null);
      await load();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível atualizar o usuário.",
      );
    }
  };

  const handleDelete = async (user: UserRecord) => {
    if (!token || !window.confirm(`Excluir ${user.name}?`)) return;
    try {
      await deleteUser(token, user.id);
      setNotice("Usuário excluído.");
      setError(null);
      await load();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir o usuário.",
      );
    }
  };

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Área administrativa"
        title="Usuários"
        description="Crie solicitantes e gestores, edite dados ou remova acessos."
        action={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => openForm(null)}
          >
            Novo usuário
          </Button>
        }
      />

      <ErrorAlert message={error} />
      <NoticeAlert message={notice} />

      {loading ? (
        <LoadingState label="Carregando usuários..." />
      ) : users.length === 0 ? (
        <EmptyState title="Nenhum usuário cadastrado" />
      ) : (
        <Card withBorder radius="md" p={0} style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover verticalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Nome</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Perfil</Table.Th>
                <Table.Th ta="right">Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users.map((user) => (
                <Table.Tr key={user.id}>
                  <Table.Td>
                    <Text fw={600}>{user.name}</Text>
                    {user.id === userId && (
                      <Text size="xs" c="dimmed">
                        você
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>{user.email}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={user.role === "MANAGER" ? "violet" : "gray"}
                      variant="light"
                    >
                      {user.role === "MANAGER" ? "Gestor" : "Solicitante"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group justify="end" gap="xs" wrap="nowrap">
                      <Button
                        size="xs"
                        variant="subtle"
                        leftSection={<IconEdit size={14} />}
                        onClick={() => openForm(user)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        disabled={user.id === userId}
                        onClick={() => void handleDelete(user)}
                      >
                        Excluir
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Card>
      )}

      <UserFormModal
        opened={modalOpen}
        user={editing}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />
    </Stack>
  );
}
