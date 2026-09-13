"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Modal,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconEdit,
  IconEye,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  changeOccurrenceStatus,
  assignOccurrence,
  createUser,
  deleteUser,
  getOccurrences,
  getUsers,
  updateOccurrence,
  updateUser,
} from "@/services/resolve-ai";
import type {
  OccurrenceRecord,
  OccurrencePriority,
  OccurrenceStatus,
  UserRecord,
  UserRole,
} from "@/types/resolve-ai";
import {
  getNextStatuses,
  isFinalStatus,
  priorityLabels,
  statusLabels,
} from "@/types/resolve-ai";
import { CategoryPanel } from "./category-panel";
import { DashboardPanel } from "./dashboard-panel";

const statusLabelsByValue: Record<OccurrenceStatus, string> = {
  OPEN: "Reabrir",
  IN_ANALYSIS: "Colocar em análise",
  IN_PROGRESS: "Iniciar atendimento",
  RESOLVED: "Marcar como resolvida",
  CANCELLED: "Cancelar",
};

export function ManagementWorkspace() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.accessToken;
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [occurrences, setOccurrences] = useState<OccurrenceRecord[]>([]);
  const [managers, setManagers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "REQUESTER" as UserRole,
  });
  const [noteByOccurrence, setNoteByOccurrence] = useState<
    Record<number, string>
  >({});
  const [editingOccurrence, setEditingOccurrence] =
    useState<OccurrenceRecord | null>(null);
  const [occurrenceForm, setOccurrenceForm] = useState({
    title: "",
    description: "",
    priority: "MEDIUM" as OccurrencePriority,
    locationText: "",
    locationReference: "",
    resolution: "",
  });
  const [occurrenceModalOpen, setOccurrenceModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [userData, occurrenceData] = await Promise.all([
        getUsers(token),
        getOccurrences(token),
      ]);
      setUsers(userData);
      setManagers(userData.filter((user) => user.role === "MANAGER"));
      setOccurrences(occurrenceData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar a gestão.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function openCreateUser() {
    setEditingUser(null);
    setUserForm({ name: "", email: "", password: "", role: "REQUESTER" });
    setUserModalOpen(true);
  }

  function openEditUser(user: UserRecord) {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setUserModalOpen(true);
  }

  async function handleUserSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    try {
      if (editingUser) {
        await updateUser(token, editingUser.id, {
          name: userForm.name,
          email: userForm.email,
          ...(userForm.password ? { password: userForm.password } : {}),
        });
        setNotice("Usuário atualizado.");
      } else {
        await createUser(
          token,
          {
            name: userForm.name,
            email: userForm.email,
            password: userForm.password,
          },
          userForm.role,
        );
        setNotice("Usuário criado.");
      }
      setUserModalOpen(false);
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível salvar o usuário.",
      );
    }
  }

  async function handleDeleteUser(user: UserRecord) {
    if (!token || !window.confirm(`Excluir ${user.name}?`)) return;
    try {
      await deleteUser(token, user.id);
      setNotice("Usuário excluído.");
      await loadData();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Não foi possível excluir o usuário.",
      );
    }
  }

  async function approveOccurrence(
    occurrence: OccurrenceRecord,
    nextStatus: OccurrenceStatus,
  ) {
    if (!token) return;
    const note = noteByOccurrence[occurrence.id];
    try {
      if (
        nextStatus === "RESOLVED" &&
        !occurrence.resolution &&
        !note?.trim()
      ) {
        setError(
          "Descreva como o problema foi resolvido no campo de observação antes de concluir.",
        );
        return;
      }
      if (nextStatus === "RESOLVED" && !occurrence.resolution) {
        await updateOccurrence(token, occurrence.id, {
          resolution: note!.trim(),
        });
      }
      await changeOccurrenceStatus(token, occurrence.id, nextStatus, note);
      setNotice(`Solicitação #${occurrence.id} atualizada.`);
      await loadData();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Não foi possível atualizar a solicitação.",
      );
    }
  }

  async function handleAssignment(
    occurrence: OccurrenceRecord,
    assigneeId: string | null,
  ) {
    if (!token || isFinalStatus(occurrence.status)) return;
    try {
      await assignOccurrence(
        token,
        occurrence.id,
        assigneeId ? Number(assigneeId) : null,
        "Responsável atualizado na gestão.",
      );
      setNotice(`Responsável da solicitação #${occurrence.id} atualizado.`);
      await loadData();
    } catch (assignmentError) {
      setError(
        assignmentError instanceof Error
          ? assignmentError.message
          : "Não foi possível delegar a solicitação.",
      );
    }
  }

  function openOccurrenceEdit(occurrence: OccurrenceRecord) {
    setEditingOccurrence(occurrence);
    setOccurrenceForm({
      title: occurrence.title,
      description: occurrence.description,
      priority: occurrence.priority,
      locationText: occurrence.locationText ?? "",
      locationReference: occurrence.locationReference ?? "",
      resolution: occurrence.resolution ?? "",
    });
    setOccurrenceModalOpen(true);
  }

  async function saveOccurrence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !editingOccurrence) return;
    try {
      await updateOccurrence(token, editingOccurrence.id, occurrenceForm);
      setOccurrenceModalOpen(false);
      setNotice("Solicitação atualizada.");
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível editar a solicitação.",
      );
    }
  }

  if (sessionStatus === "loading" || loading)
    return (
      <Container size="lg" py={64}>
        <Text c="dimmed">Carregando gestão...</Text>
      </Container>
    );

  return (
    <main id="conteudo-principal">
      <Container size="lg" py={{ base: 32, sm: 56 }}>
        <Stack gap="xl">
          <Stack gap={4}>
            <Text className="eyebrow">Área administrativa</Text>
            <Title order={1}>Central de gestão</Title>
            <Text c="dimmed">
              Administre usuários e conduza as solicitações até a resolução.
            </Text>
          </Stack>
          {error && (
            <Alert
              icon={<IconAlertCircle size={18} />}
              color="red"
              title="Atenção"
            >
              {error}
            </Alert>
          )}
          {notice && (
            <Alert color="teal" title="Atualizado">
              {notice}
            </Alert>
          )}
          <Tabs defaultValue="requests" variant="outline">
            <Tabs.List>
              <Tabs.Tab value="requests">
                Solicitações{" "}
                <Badge ml="xs" size="sm">
                  {occurrences.length}
                </Badge>
              </Tabs.Tab>
              <Tabs.Tab value="users">
                Usuários{" "}
                <Badge ml="xs" size="sm">
                  {users.length}
                </Badge>
              </Tabs.Tab>
              <Tabs.Tab value="categories">Categorias</Tabs.Tab>
              <Tabs.Tab value="dashboard">Dashboard</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="requests" pt="xl">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Aprovação de solicitações</Title>
                  <Text size="sm" c="dimmed">
                    Atualize cada etapa do atendimento.
                  </Text>
                </Group>
                <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                  {occurrences.map((occurrence) => {
                    const final = isFinalStatus(occurrence.status);
                    const nextStatuses = getNextStatuses(occurrence.status);
                    return (
                      <Card key={occurrence.id} withBorder radius="md">
                        <Stack gap="sm">
                          <Group justify="space-between" align="start">
                            <div>
                              <Text fw={700}>{occurrence.title}</Text>
                              <Text size="xs" c="dimmed">
                                Solicitação #{occurrence.id} · usuário{" "}
                                {occurrence.requesterId}
                              </Text>
                            </div>
                            <Badge
                              color={
                                occurrence.status === "RESOLVED"
                                  ? "teal"
                                  : occurrence.status === "CANCELLED"
                                    ? "red"
                                    : "blue"
                              }
                            >
                              {statusLabels[occurrence.status]}
                            </Badge>
                          </Group>
                          <Text size="sm" c="dimmed" lineClamp={3}>
                            {occurrence.description}
                          </Text>
                          <Group gap="xs">
                            <Badge variant="outline">
                              {priorityLabels[occurrence.priority]}
                            </Badge>
                            {occurrence.locationText && (
                              <Text size="xs" c="dimmed">
                                {occurrence.locationText}
                              </Text>
                            )}
                          </Group>
                          <Select
                            label="Responsável"
                            placeholder={
                              final
                                ? "Ocorrência em status final"
                                : "Delegar para um gestor"
                            }
                            clearable
                            disabled={final}
                            data={managers.map((manager) => ({
                              value: String(manager.id),
                              label: manager.name,
                            }))}
                            value={
                              occurrence.assigneeId
                                ? String(occurrence.assigneeId)
                                : null
                            }
                            onChange={(value) =>
                              void handleAssignment(occurrence, value)
                            }
                          />
                          <Group gap="xs">
                            <Button
                              component={Link}
                              href={`/solicitacoes/${occurrence.id}`}
                              size="xs"
                              variant="subtle"
                              color="dark"
                              leftSection={<IconEye size={14} />}
                            >
                              Ver detalhes
                            </Button>
                            <Button
                              size="xs"
                              variant="subtle"
                              leftSection={<IconEdit size={14} />}
                              disabled={final}
                              onClick={() => openOccurrenceEdit(occurrence)}
                            >
                              Editar
                            </Button>
                          </Group>
                          {!final && nextStatuses.length > 0 && (
                            <>
                              <Textarea
                                size="xs"
                                placeholder={
                                  nextStatuses.includes("RESOLVED")
                                    ? "Observação da decisão (obrigatória para concluir, vira o texto de resolução)"
                                    : "Observação da decisão"
                                }
                                value={noteByOccurrence[occurrence.id] ?? ""}
                                onChange={(event) =>
                                  setNoteByOccurrence({
                                    ...noteByOccurrence,
                                    [occurrence.id]: event.currentTarget.value,
                                  })
                                }
                              />
                              <Group gap="xs">
                                {nextStatuses.map((statusValue) => (
                                  <Button
                                    key={statusValue}
                                    size="xs"
                                    variant={
                                      statusValue === "RESOLVED"
                                        ? "filled"
                                        : "light"
                                    }
                                    color={
                                      statusValue === "CANCELLED"
                                        ? "red"
                                        : statusValue === "RESOLVED"
                                          ? "teal"
                                          : "blue"
                                    }
                                    leftSection={
                                      statusValue === "RESOLVED" ? (
                                        <IconCheck size={14} />
                                      ) : undefined
                                    }
                                    onClick={() =>
                                      approveOccurrence(occurrence, statusValue)
                                    }
                                  >
                                    {statusLabelsByValue[statusValue]}
                                  </Button>
                                ))}
                              </Group>
                            </>
                          )}
                        </Stack>
                      </Card>
                    );
                  })}
                </SimpleGrid>
              </Stack>
            </Tabs.Panel>
            <Tabs.Panel value="categories" pt="xl">
              <CategoryPanel
                token={token}
                onError={setError}
                onNotice={setNotice}
              />
            </Tabs.Panel>
            <Tabs.Panel value="dashboard" pt="xl">
              <DashboardPanel token={token} onError={setError} />
            </Tabs.Panel>
            <Tabs.Panel value="users" pt="xl">
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Title order={3}>Usuários</Title>
                    <Text size="sm" c="dimmed">
                      Crie solicitantes e gestores, edite dados ou remova
                      acessos.
                    </Text>
                  </div>
                  <Button
                    leftSection={<IconPlus size={16} />}
                    onClick={openCreateUser}
                  >
                    Novo usuário
                  </Button>
                </Group>
                <Card withBorder p={0} style={{ overflowX: "auto" }}>
                  <Table
                    striped
                    highlightOnHover
                    withTableBorder={false}
                    verticalSpacing="md"
                  >
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
                            <Text size="xs" c="dimmed">
                              #{user.id}
                            </Text>
                          </Table.Td>
                          <Table.Td>{user.email}</Table.Td>
                          <Table.Td>
                            <Badge
                              color={
                                user.role === "MANAGER" ? "violet" : "gray"
                              }
                            >
                              {user.role === "MANAGER"
                                ? "Gestor"
                                : "Solicitante"}
                            </Badge>
                          </Table.Td>
                          <Table.Td>
                            <Group justify="end" gap="xs">
                              <Button
                                size="xs"
                                variant="subtle"
                                leftSection={<IconEdit size={14} />}
                                onClick={() => openEditUser(user)}
                              >
                                Editar
                              </Button>
                              <Button
                                size="xs"
                                variant="subtle"
                                color="red"
                                leftSection={<IconTrash size={14} />}
                                onClick={() => handleDeleteUser(user)}
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
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Stack>
      </Container>
      <Modal
        opened={occurrenceModalOpen}
        onClose={() => setOccurrenceModalOpen(false)}
        title="Editar solicitação"
        centered
      >
        <form onSubmit={saveOccurrence}>
          <Stack>
            <TextInput
              label="Título"
              value={occurrenceForm.title}
              onChange={(event) =>
                setOccurrenceForm({
                  ...occurrenceForm,
                  title: event.currentTarget.value,
                })
              }
              required
            />
            <Textarea
              label="Descrição"
              minRows={4}
              value={occurrenceForm.description}
              onChange={(event) =>
                setOccurrenceForm({
                  ...occurrenceForm,
                  description: event.currentTarget.value,
                })
              }
              required
            />
            <Select
              label="Prioridade"
              data={[
                { value: "LOW", label: "Baixa" },
                { value: "MEDIUM", label: "Média" },
                { value: "HIGH", label: "Alta" },
                { value: "CRITICAL", label: "Crítica" },
              ]}
              value={occurrenceForm.priority}
              onChange={(value) =>
                setOccurrenceForm({
                  ...occurrenceForm,
                  priority: (value ?? "MEDIUM") as OccurrencePriority,
                })
              }
            />
            <TextInput
              label="Local"
              value={occurrenceForm.locationText}
              onChange={(event) =>
                setOccurrenceForm({
                  ...occurrenceForm,
                  locationText: event.currentTarget.value,
                })
              }
            />
            <TextInput
              label="Referência"
              value={occurrenceForm.locationReference}
              onChange={(event) =>
                setOccurrenceForm({
                  ...occurrenceForm,
                  locationReference: event.currentTarget.value,
                })
              }
            />
            <Textarea
              label="Solução aplicada"
              value={occurrenceForm.resolution}
              onChange={(event) =>
                setOccurrenceForm({
                  ...occurrenceForm,
                  resolution: event.currentTarget.value,
                })
              }
            />
            <Button type="submit">Salvar solicitação</Button>
          </Stack>
        </form>
      </Modal>
      <Modal
        opened={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title={editingUser ? "Editar usuário" : "Novo usuário"}
        centered
      >
        <form onSubmit={handleUserSubmit}>
          <Stack>
            <TextInput
              label="Nome"
              value={userForm.name}
              onChange={(event) =>
                setUserForm({ ...userForm, name: event.currentTarget.value })
              }
              required
            />
            <TextInput
              label="Email"
              type="email"
              value={userForm.email}
              onChange={(event) =>
                setUserForm({ ...userForm, email: event.currentTarget.value })
              }
              required
            />
            <PasswordInput
              label={editingUser ? "Nova senha (opcional)" : "Senha"}
              value={userForm.password}
              onChange={(event) =>
                setUserForm({
                  ...userForm,
                  password: event.currentTarget.value,
                })
              }
              required={!editingUser}
              minLength={6}
            />
            {!editingUser && (
              <Select
                label="Perfil"
                data={[
                  { value: "REQUESTER", label: "Solicitante" },
                  { value: "MANAGER", label: "Gestor" },
                ]}
                value={userForm.role}
                onChange={(value) =>
                  setUserForm({
                    ...userForm,
                    role: (value ?? "REQUESTER") as UserRole,
                  })
                }
              />
            )}
            <Button type="submit">Salvar usuário</Button>
          </Stack>
        </form>
      </Modal>
    </main>
  );
}
