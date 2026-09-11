"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  FileInput,
  Group,
  Rating,
  Stack,
  Text,
  Textarea,
  Timeline,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconArrowLeft,
  IconMessage,
  IconSend,
  IconUpload,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import {
  createComment,
  createRating,
  getComments,
  getOccurrenceEvents,
  getOccurrences,
  getRatings,
  uploadAttachment,
} from "@/services/resolve-ai";
import type {
  CommentRecord,
  OccurrenceEventRecord,
  OccurrenceRecord,
  RatingRecord,
} from "@/types/resolve-ai";
import { priorityLabels, statusLabels } from "@/types/resolve-ai";

export function RequestDetail({ id }: { id: number }) {
  const { data: session, status } = useSession();
  const token = session?.accessToken;
  const [occurrence, setOccurrence] = useState<OccurrenceRecord | null>(null);
  const [events, setEvents] = useState<OccurrenceEventRecord[]>([]);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [rating, setRating] = useState<RatingRecord | null>(null);
  const [comment, setComment] = useState("");
  const [score, setScore] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [occurrences, eventData, commentData, ratingData] =
        await Promise.all([
          getOccurrences(token),
          getOccurrenceEvents(token, id),
          getComments(token),
          getRatings(token),
        ]);
      setOccurrence(occurrences.find((item) => item.id === id) ?? null);
      setEvents(eventData);
      setComments(
        commentData.filter(
          (item) => item.occurrenceId === id && !item.isInternal,
        ),
      );
      setRating(ratingData.find((item) => item.occurrenceId === id) ?? null);
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

  async function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token || !comment.trim()) return;
    try {
      setSaving(true);
      await createComment(token, { occurrenceId: id, body: comment.trim() });
      setComment("");
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

  if (status === "loading" || !occurrence)
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
            href="/solicitacoes"
            variant="subtle"
            color="dark"
            leftSection={<IconArrowLeft size={16} />}
            w="fit-content"
          >
            Voltar para solicitações
          </Button>
          {error && (
            <Alert icon={<IconAlertCircle size={18} />} color="red">
              {error}
            </Alert>
          )}
          {notice && <Alert color="teal">{notice}</Alert>}
          <Stack gap="xs">
            <Group justify="space-between" align="start">
              <div>
                <Text size="sm" c="dimmed">
                  Solicitação #{occurrence.id}
                </Text>
                <Title order={1}>{occurrence.title}</Title>
              </div>
              <Badge>{statusLabels[occurrence.status]}</Badge>
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
            </Stack>
          </Card>
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
              >
                Enviar imagem
              </Button>
            </Stack>
          </Card>
          <Card withBorder>
            <Stack>
              <Title order={2}>Comentários</Title>
              {comments.length === 0 && (
                <Text c="dimmed">Ainda não há comentários públicos.</Text>
              )}
              {comments.map((item) => (
                <Stack key={item.id} gap={2}>
                  <Group gap="xs">
                    <IconMessage size={15} />
                    <Text fw={600}>Usuário #{item.authorId}</Text>
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
                  <Button
                    type="submit"
                    leftSection={<IconSend size={16} />}
                    loading={saving}
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
                <Title order={2}>Avalie a resolução</Title>
                {rating ? (
                  <Text c="teal">
                    Esta solicitação já foi avaliada com nota {rating.score}.
                  </Text>
                ) : (
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
                      >
                        Enviar avaliação
                      </Button>
                    </Stack>
                  </form>
                )}
              </Stack>
            </Card>
          )}
        </Stack>
      </Container>
    </main>
  );
}
