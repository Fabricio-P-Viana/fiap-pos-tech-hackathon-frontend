"use client";

import {
  Button,
  Card,
  Group,
  Stack,
  Switch,
  Table,
  Text,
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
import type { CategoryFormValues } from "@/schemas/category";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  EmptyState,
  ErrorAlert,
  LoadingState,
  NoticeAlert,
} from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";
import { CategoryFormModal } from "./category-form-modal";

export function CategoriesPanel() {
  const { token } = useCurrentUser();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRecord | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setCategories(await getCategories(token));
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as categorias.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const runAction = async (
    action: () => Promise<unknown>,
    successMessage: string,
    fallbackError: string,
  ) => {
    try {
      await action();
      setNotice(successMessage);
      setError(null);
      await load();
      return true;
    } catch (actionError) {
      setNotice(null);
      setError(
        actionError instanceof Error ? actionError.message : fallbackError,
      );
      return false;
    }
  };

  const openForm = (category: CategoryRecord | null) => {
    setEditing(category);
    setModalOpen(true);
  };

  const handleSubmit = async (values: CategoryFormValues) => {
    if (!token) return;
    const payload = {
      name: values.name,
      description: values.description || undefined,
    };
    const saved = await runAction(
      () =>
        editing
          ? updateCategory(token, editing.id, payload)
          : createCategory(token, payload),
      editing ? "Categoria atualizada." : "Categoria criada.",
      "Não foi possível salvar a categoria.",
    );
    if (saved) setModalOpen(false);
  };

  const handleToggle = async (category: CategoryRecord) => {
    if (!token) return;
    setTogglingId(category.id);
    await runAction(
      () => updateCategory(token, category.id, { active: !category.active }),
      category.active
        ? `Categoria "${category.name}" desativada: não aparece mais para novas solicitações.`
        : `Categoria "${category.name}" reativada.`,
      "Não foi possível atualizar a categoria.",
    );
    setTogglingId(null);
  };

  const handleDelete = async (category: CategoryRecord) => {
    if (!token || !window.confirm(`Excluir a categoria ${category.name}?`))
      return;
    await runAction(
      () => deleteCategory(token, category.id),
      "Categoria excluída.",
      "Não foi possível excluir a categoria. Se ela já foi usada, desative-a em vez de excluir.",
    );
  };

  return (
    <Stack gap="lg">
      <PageHeader
        eyebrow="Área administrativa"
        title="Categorias"
        description="Organize as opções usadas na abertura de solicitações. Categorias inativas deixam de aparecer para novos pedidos."
        action={
          <Button
            leftSection={<IconPlus size={16} />}
            onClick={() => openForm(null)}
          >
            Nova categoria
          </Button>
        }
      />

      <ErrorAlert message={error} />
      <NoticeAlert message={notice} />

      {loading ? (
        <LoadingState label="Carregando categorias..." />
      ) : categories.length === 0 ? (
        <EmptyState
          title="Nenhuma categoria cadastrada"
          description="Crie a primeira categoria para que os solicitantes possam abrir pedidos."
        />
      ) : (
        <Card withBorder radius="md" p={0} style={{ overflowX: "auto" }}>
          <Table striped highlightOnHover verticalSpacing="md">
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
                  <Table.Td>
                    <Text fw={600}>{category.name}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" c={category.description ? undefined : "dimmed"}>
                      {category.description || "Sem descrição"}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Switch
                      checked={category.active}
                      disabled={togglingId === category.id}
                      onChange={() => void handleToggle(category)}
                      label={category.active ? "Ativa" : "Inativa"}
                      color="dark"
                    />
                  </Table.Td>
                  <Table.Td>
                    <Group justify="end" gap="xs" wrap="nowrap">
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
                        onClick={() => void handleDelete(category)}
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

      <CategoryFormModal
        opened={modalOpen}
        category={editing}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </Stack>
  );
}
