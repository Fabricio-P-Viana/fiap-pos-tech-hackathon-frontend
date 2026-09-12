"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Checkbox,
  Container,
  Divider,
  FileInput,
  Group,
  Rating,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Timeline,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconBan,
  IconCheck,
  IconMessage,
  IconSend,
  IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  assignOccurrence,
  cancelOccurrence,
  changeOccurrenceStatus,
  createComment,
  createRating,
  getCategories,
  getComments,
  getOccurrenceById,
  getOccurrenceEvents,
  getRatings,
  getUsers,
  updateOccurrence,
  uploadAttachment,
} from "@/services/resolve-ai";
import type {
  CategoryRecord,
  CommentRecord,
  OccurrenceEventRecord,
  OccurrenceRecord,
  OccurrenceStatus,
  RatingRecord,
  UserRecord,
} from "@/types/resolve-ai";
import {
  getNextStatuses,
  isFinalStatus,
  priorityLabels,
  statusLabels,
} from "@/types/resolve-ai";

const statusActionLabels: Record<OccurrenceStatus, string> = {
  OPEN: "Reabrir",
  IN_ANALYSIS: "Colocar em análise",
  IN_PROGRESS: "Iniciar atendimento",
  RESOLVED: "Marcar como resolvida",
  CANCELLED: "Cancelar",
};

const priorityOptions = Object.entries(priorityLabels).map(
  ([value, label]) => ({ value, label }),
);

export function RequestDetail({ id }: { id: number }) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const currentUserId = Number(session?.user?.id);
  const isManager = session?.user?.role === "MANAGER";

  const [occurrence, setOccurrence] = useState<OccurrenceRecord | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [managers, setManagers] = useState<UserRecord[]>([]);
  const [events, setEvents] = useState<OccurrenceEventRecord[]>([]);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [rating, setRating] = useState<RatingRecord | null>(null);

  const [comment, setComment] = useState("");
  const [commentInternal, setCommentInternal] = useState(false);
  const [score, setScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [statusNote, setStatusNote] = useState("");

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: "MEDIUM",
    locationText: "",
    locationReference: "",
    resolution: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isOwner = occurrence?.requesterId === currentUserId;
  const final = occurrence ? isFinalStatus(occurrence.status) : true;
  // Solicitante só edita/cancela enquanto OPEN; gestor enquanto não for status final.
  const canEdit = occurrence
    ? (isOwner && occurrence.status === "OPEN") || (isManager && !final)
    : false;
  const canCancel = canEdit; // mesma regra de negócio do backend
  const canRate = occurrence
    ? isOwner && occurrence.status === "RESOLVED"
    : false;
  const canManageStatus = isManager && !final;
  const nextStatuses = occurrence ? getNextStatuses(occurrence.status) : [];

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const occurrenceData = await getOccurrenceById(token, id);
      setOccurrence(occurrenceData);
      setEditForm({
        title: occurrenceData.title,
        description: occurrenceData.description,
        categoryId: String(occurrenceData.categoryId),
        priority: occurrenceData.priority,
        locationText: occurrenceData.locationText ?? "",
        locationReference: occurrenceData.locationReference ?? "",
        resolution: occurrenceData.resolution ?? "",
      });

      const [categoryData, eventData, commentData] = await Promise.all([
        getCategories(token),
        getOccurrenceEvents(token, id),
        getComments(token, id),
      ]);
      setCategories(categoryData.filter((category) => category.active));
      setEvents(eventData);
      setComments(commentData);

      if (occurrenceData.status === "RESOLVED") {
        const ratingData = await getRatings(token);
        setRating(
          ratingData.find((item) => item.occurrenceId === id) ?? null,
        );
      }
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar a solicitação.",
      );
    }
  }, [id, token]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!token || !isManager) return;
    getUsers(token)
      .then((users) => setManagers(users.filter((u) => u.role === "MANAGER")))
      .catch(() => undefined);
  }, [token, isManager]);

  async function submitEdit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !occurrence) return;
    try {
      setSaving(true);
      await updateOccurrence(token, occurrence.id, {
        title: editForm.title,
        description: editForm.description,
        categoryId: Number(editForm.categoryId),
        locationText: editForm.locationText || undefined,
        locationReference: editForm.locationReference || undefined,
        ...(isManager
          ? {
              priority: editForm.priority as OccurrenceRecord["priority"],
              resolution: editForm.resolution || undefined,
            }
          : {}),
      });
      setNotice("Solicitação atualizada.");
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível editar a solicitação.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCancel() {
    if (!token || !occurrence) return;
    // O motivo é obrigatório: a solicitação fica como histórico.
    if (!statusNote.trim()) {
      setError("Informe o motivo do cancelamento na observação.");
      return;
    }
    if (!window.confirm("Cancelar esta solicitação?")) return;
    try {
      setSaving(true);
      await cancelOccurrence(token, occurrence.id, statusNote.trim());
      setNotice("Solicitação cancelada.");
      await load();
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : "Não foi possível cancelar a solicitação.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(nextStatus: OccurrenceStatus) {
    if (!token || !occurrence) return;
    try {
      setSaving(true);
      // O backend exige "resolution" preenchida antes de aceitar RESOLVED.
      if (nextStatus === "RESOLVED" && !occurrence.resolution) {
        if (!statusNote.trim()) {
          setError(
            "Descreva como o problema foi resolvido na observação antes de concluir.",
          );
          return;
        }
        await updateOccurrence(token, occurrence.id, {
          resolution: statusNote.trim(),
        });
      }
      await changeOccurrenceStatus(
        token,
        occurrence.id,
        nextStatus,
        statusNote || undefined,
      );
      setStatusNote("");
      setNotice("Status atualizado.");
      await load();
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "Não foi possível atualizar o status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(assigneeId: string | null) {
    if (!token || !occurrence) return;
    try {
      await assignOccurrence(
        token,
        occurrence.id,
        assigneeId ? Number(assigneeId) : null,
      );
      setNotice("Responsável atualizado.");
      await load();
    } catch (assignError) {
      setError(
        assignError instanceof Error
          ? assignError.message
          : "Não foi possível delegar a solicitação.",
      );
    }
  }

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !comment.trim()) return;
    try {
      setSaving(true);
      await createComment(token, {
        occurrenceId: id,
        body: comment.trim(),
        ...(isManager ? { isInternal: commentInternal } : {}),
      });
      setComment("");
      setCommentInternal(false);
      setNotice("Comentário publicado.");
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível comentar.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitRating(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || score < 1) return;
    try {
      setSaving(true);
      await createRating(token, {
        occurrenceId: id,
        score,
        comment: ratingComment.trim() || undefined,
      });
      setNotice("Avaliação enviada.");
      await load();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Não foi possível avaliar.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function submitFile() {
    if (!token || !file) return;
    try {
      setSaving(true);
      await uploadAttachment(token, id, file);
      setFile(null);
      setNotice("Imagem anexada.");
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível anexar a imagem.",
      );
    } finally {
      setSaving(false);
    }
  }

  const backHref = isManager ? "/gestao" : "/solicitacoes";

  if (status === "loading" || (!occurrence && !error))
    return (
      <Container size="md" py={64}>
        <Text c="dimmed">Carregando solicitação...</Text>
      </Container>
    );

  return (
    <main id="conteudo-principal">
      <Container size="md" py={{ base: 32, sm: 56 }}>
        <Stack gap="xl">
          <Button
            component={Link}
            href={backHref}
            variant="subtle"
            color="dark"
            leftSection={<IconArrowLeft size={16} />}
            w="fit-content"
          >
            Voltar
          </Button>
          {error && (
            <Alert icon={<IconAlertCircle size={18} />} color="red">
              {error}
            </Alert>
          )}
          {notice && <Alert color="teal">{notice}</Alert>}

          {occurrence && (
            <>
              <Stack gap="xs">
                <Group justify="space-between" align="start">
                  <div>
                    <Text size="sm" c="dimmed">
                      Solicitação #{occurrence.id}
                    </Text>
                    <Title order={1}>{occurrence.title}</Title>
                  </div>
                  <Group gap="xs">
                    <Badge>{statusLabels[occurrence.status]}</Badge>
                    {canCancel && (
                      <Button
                        size="xs"
                        color="red"
                        variant="outline"
                        leftSection={<IconBan size={14} />}
                        onClick={() => void handleCancel()}
                      >
                        Cancelar
                      </Button>
                    )}
                  </Group>
                </Group>
                <Group>
                  <Badge variant="outline">
                    {priorityLabels[occurrence.priority]}
                  </Badge>
                  {occurrence.locationText && (
                    <Text size="sm" c="dimmed">
                      {occurrence.locationText}
                    </Text>
                  )}
                </Group>
              </Stack>

              <Card withBorder>
                <Stack>
                  <Text>{occurrence.description}</Text>
                  {occurrence.locationReference && (
                    <Text size="sm" c="dimmed">
                      Referência: {occurrence.locationReference}
                    </Text>
                  )}
                  {occurrence.resolution && (
                    <>
                      <Divider label="Resolução" />
                      <Text size="sm">{occurrence.resolution}</Text>
                    </>
                  )}
                </Stack>
              </Card>

              {canEdit && (
                <Card withBorder>
                  <Stack>
                    <Title order={2}>Editar solicitação</Title>
                    <Text size="sm" c="dimmed">
                      {isManager
                        ? "Como gestor, você pode alterar qualquer campo enquanto a ocorrência não estiver em um status final."
                        : "Você pode editar título, descrição, categoria e localização enquanto a solicitação estiver aberta."}
                    </Text>
                    <form onSubmit={submitEdit}>
                      <Stack gap="sm">
                        <TextInput
                          label="Título"
                          value={editForm.title}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              title: event.currentTarget.value,
                            })
                          }
                          required
                        />
                        <Textarea
                          label="Descrição"
                          minRows={3}
                          value={editForm.description}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              description: event.currentTarget.value,
                            })
                          }
                          required
                        />
                        <Select
                          label="Categoria"
                          data={categories.map((category) => ({
                            value: String(category.id),
                            label: category.name,
                          }))}
                          value={editForm.categoryId}
                          onChange={(value) =>
                            setEditForm({
                              ...editForm,
                              categoryId: value ?? editForm.categoryId,
                            })
                          }
                          required
                        />
                        <TextInput
                          label="Local"
                          value={editForm.locationText}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              locationText: event.currentTarget.value,
                            })
                          }
                        />
                        <TextInput
                          label="Referência"
                          value={editForm.locationReference}
                          onChange={(event) =>
                            setEditForm({
                              ...editForm,
                              locationReference: event.currentTarget.value,
                            })
                          }
                        />
                        {isManager && (
                          <>
                            <Select
                              label="Prioridade"
                              data={priorityOptions}
                              value={editForm.priority}
                              onChange={(value) =>
                                setEditForm({
                                  ...editForm,
                                  priority: value ?? editForm.priority,
                                })
                              }
                            />
                            <Textarea
                              label="Resolução"
                              placeholder="Como o problema foi/está sendo resolvido"
                              minRows={2}
                              value={editForm.resolution}
                              onChange={(event) =>
                                setEditForm({
                                  ...editForm,
                                  resolution: event.currentTarget.value,
                                })
                              }
                            />
                          </>
                        )}
                        <Button type="submit" loading={saving} w="fit-content">
                          Salvar alterações
                        </Button>
                      </Stack>
                    </form>
                  </Stack>
                </Card>
              )}

              {isManager && (
                <Card withBorder>
                  <Stack>
                    <Title order={2}>Gestão do atendimento</Title>
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
                      onChange={(value) => void handleAssign(value)}
                    />
                    {canManageStatus && nextStatuses.length > 0 && (
                      <>
                        <Textarea
                          label="Observação da decisão"
                          placeholder={
                            nextStatuses.includes("RESOLVED")
                              ? "Obrigatória para concluir — vira o texto de resolução"
                              : "Opcional"
                          }
                          value={statusNote}
                          onChange={(event) =>
                            setStatusNote(event.currentTarget.value)
                          }
                        />
                        <Group gap="xs">
                          {nextStatuses.map((nextStatus) => (
                            <Button
                              key={nextStatus}
                              size="sm"
                              variant={
                                nextStatus === "RESOLVED" ? "filled" : "light"
                              }
                              color={
                                nextStatus === "CANCELLED"
                                  ? "red"
                                  : nextStatus === "RESOLVED"
                                    ? "teal"
                                    : "blue"
                              }
                              leftSection={
                                nextStatus === "RESOLVED" ? (
                                  <IconCheck size={14} />
                                ) : undefined
                              }
                              loading={saving}
                              onClick={() => void handleStatusChange(nextStatus)}
                            >
                              {statusActionLabels[nextStatus]}
                            </Button>
                          ))}
                        </Group>
                      </>
                    )}
                  </Stack>
                </Card>
              )}

              <Card withBorder>
                <Stack gap="lg">
                  <Title order={2}>Linha do tempo</Title>
                  <Timeline
                    active={Math.max(events.length - 1, 0)}
                    bulletSize={24}
                    lineWidth={2}
                  >
                    {events.map((event) => (
                      <Timeline.Item
                        key={event.id}
                        title={
                          event.type === "CREATED"
                            ? "Solicitação aberta"
                            : event.type === "STATUS_CHANGED"
                              ? `Status: ${event.newValue ? (statusLabels[event.newValue as keyof typeof statusLabels] ?? event.newValue) : "atualizado"}`
                              : event.type === "PRIORITY_CHANGED"
                                ? "Prioridade alterada"
                                : "Responsável alterado"
                        }
                      >
                        <Text size="sm" c="dimmed">
                          {event.note ||
                            `${event.previousValue ?? ""} ${event.newValue ? `→ ${event.newValue}` : ""}`}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Usuário #{event.actorId}
                          {event.createdAt
                            ? ` · ${new Date(event.createdAt).toLocaleString("pt-BR")}`
                            : ""}
                        </Text>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                </Stack>
              </Card>

              <Card withBorder>
                <Stack>
                  <Title order={2}>Imagem da ocorrência</Title>
                  <FileInput
                    value={file}
                    onChange={setFile}
                    accept="image/png,image/jpeg,image/webp"
                    placeholder="Selecione uma imagem"
                    leftSection={<IconUpload size={16} />}
                  />
                  <Button
                    onClick={() => void submitFile()}
                    disabled={!file}
                    loading={saving}
                    w="fit-content"
                  >
                    Enviar imagem
                  </Button>
                </Stack>
              </Card>

              <Card withBorder>
                <Stack>
                  <Title order={2}>Comentários</Title>
                  {comments.length === 0 && (
                    <Text c="dimmed">Ainda não há comentários.</Text>
                  )}
                  {comments.map((item) => (
                    <Stack key={item.id} gap={2}>
                      <Group gap="xs">
                        <IconMessage size={15} />
                        <Text fw={600}>Usuário #{item.authorId}</Text>
                        {item.isInternal && (
                          <Badge size="xs" color="grape">
                            Interno
                          </Badge>
                        )}
                        <Text size="xs" c="dimmed">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("pt-BR")
                            : ""}
                        </Text>
                      </Group>
                      <Text>{item.body}</Text>
                      <Divider />
                    </Stack>
                  ))}
                  <form onSubmit={submitComment}>
                    <Stack>
                      <Textarea
                        label="Adicionar comentário"
                        value={comment}
                        onChange={(event) => setComment(event.currentTarget.value)}
                        minRows={3}
                        required
                      />
                      {isManager && (
                        <Checkbox
                          label="Comentário interno (visível apenas para gestores)"
                          checked={commentInternal}
                          onChange={(event) =>
                            setCommentInternal(event.currentTarget.checked)
                          }
                        />
                      )}
                      <Button
                        type="submit"
                        leftSection={<IconSend size={16} />}
                        loading={saving}
                        w="fit-content"
                      >
                        Comentar
                      </Button>
                    </Stack>
                  </form>
                </Stack>
              </Card>

              {occurrence.status === "RESOLVED" && (
                <Card withBorder>
                  <Stack>
                    <Title order={2}>Avaliação da resolução</Title>
                    {rating ? (
                      <Stack gap={4}>
                        <Rating value={rating.score} readOnly />
                        {rating.comment && <Text>{rating.comment}</Text>}
                      </Stack>
                    ) : canRate ? (
                      <form onSubmit={submitRating}>
                        <Stack>
                          <Rating value={score} onChange={setScore} size="lg" />
                          <Textarea
                            label="Comentário da avaliação (opcional)"
                            value={ratingComment}
                            onChange={(event) =>
                              setRatingComment(event.currentTarget.value)
                            }
                          />
                          <Button
                            type="submit"
                            loading={saving}
                            disabled={score < 1}
                            w="fit-content"
                          >
                            Enviar avaliação
                          </Button>
                        </Stack>
                      </form>
                    ) : (
                      <Text c="dimmed">
                        Aguardando avaliação do solicitante.
                      </Text>
                    )}
                  </Stack>
                </Card>
              )}
            </>
          )}
        </Stack>
      </Container>
    </main>
  );
}
