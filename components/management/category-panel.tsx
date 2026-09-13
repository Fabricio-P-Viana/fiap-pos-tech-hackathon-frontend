"use client";

import {
  Button,
  Card,
  Group,
  Modal,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/resolve-ai";
import type { CategoryRecord } from "@/types/resolve-ai";

export function CategoryPanel({
  token,
  onError,
  onNotice,
}: {
  token?: string;
  onError: (message: string) => void;
  onNotice: (message: string) => void;
}) {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [opened, setOpened] = useState(false);
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setCategories(await getCategories(token));
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar categorias.",
      );
    }
  }, [onError, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  function openForm(category?: CategoryRecord) {
    setEditing(category ?? null);
    setName(category?.name ?? "");
    setDescription(category?.description ?? "");
    setOpened(true);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    try {
      if (editing)
        await updateCategory(token, editing.id, { name, description });
      else await createCategory(token, { name, description });
      setOpened(false);
      onNotice(editing ? "Categoria atualizada." : "Categoria criada.");
      await load();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a categoria.",
      );
    }
  }

  async function toggle(category: CategoryRecord) {
    if (!token) return;
    try {
      await updateCategory(token, category.id, { active: !category.active });
      onNotice("Status da categoria atualizado.");
      await load();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Não foi possível atualizar a categoria.",
      );
    }
  }

  async function remove(category: CategoryRecord) {
    if (!token || !window.confirm(`Excluir a categoria ${category.name}?`))
      return;
    try {
      await deleteCategory(token, category.id);
      onNotice("Categoria excluída.");
      await load();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a categoria.",
      );
    }
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={3}>Categorias</Title>
          <Text size="sm" c="dimmed">
            Organize as opções usadas nas solicitações.
          </Text>
        </div>
        <Button leftSection={<IconPlus size={16} />} onClick={() => openForm()}>
          Nova categoria
        </Button>
      </Group>
      <Card withBorder p={0} style={{ overflowX: "auto" }}>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Nome</Table.Th>
              <Table.Th>Descrição</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th ta="right">Ações</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {categories.map((category) => (
              <Table.Tr key={category.id}>
                <Table.Td fw={600}>{category.name}</Table.Td>
                <Table.Td>{category.description || "-"}</Table.Td>
                <Table.Td>
                  <Switch
                    checked={category.active}
                    onChange={() => void toggle(category)}
                    label={category.active ? "Ativa" : "Inativa"}
                  />
                </Table.Td>
                <Table.Td>
                  <Group justify="end" gap="xs">
                    <Button
                      size="xs"
                      variant="subtle"
                      leftSection={<IconEdit size={14} />}
                      onClick={() => openForm(category)}
                    >
                      Editar
                    </Button>
                    <Button
                      size="xs"
                      variant="subtle"
                      color="red"
                      leftSection={<IconTrash size={14} />}
                      onClick={() => void remove(category)}
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
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={editing ? "Editar categoria" : "Nova categoria"}
        centered
      >
        <form onSubmit={submit}>
          <Stack>
            <TextInput
              label="Nome"
              value={name}
              onChange={(event) => setName(event.currentTarget.value)}
              required
            />
            <TextInput
              label="Descrição"
              value={description}
              onChange={(event) => setDescription(event.currentTarget.value)}
            />
            <Button type="submit">Salvar categoria</Button>
          </Stack>
        </form>
      </Modal>
    </Stack>
  );
}
