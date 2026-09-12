"use client";

import { Button, Card, Container, Stack, Title } from "@mantine/core";
import { IconArrowLeft, IconBan } from "@tabler/icons-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  assignOccurrence,
  cancelOccurrence,
  changeOccurrencePriority,
  changeOccurrenceStatus,
  createComment,
  createRating,
  getCategories,
  getComments,
  getOccurrenceAttachments,
  getOccurrenceById,
  getOccurrenceEvents,
  getOccurrenceRating,
  getUsers,
  updateOccurrence,
  uploadAttachment,
} from "@/services/resolve-ai";
import type {
  AttachmentRecord,
  CategoryRecord,
  CommentRecord,
  OccurrenceEventRecord,
  OccurrencePriority,
  OccurrenceRecord,
  OccurrenceStatus,
  RatingRecord,
  UserRecord,
} from "@/types/resolve-ai";
import { isFinalStatus } from "@/types/resolve-ai";
import type { EditOccurrenceFormValues } from "@/schemas/occurrence";
import type {
  CommentFormValues,
  RatingFormValues,
} from "@/schemas/interaction";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  ErrorAlert,
  LoadingState,
  NoticeAlert,
} from "@/components/shared/feedback";
import { OccurrenceTimeline } from "@/components/shared/occurrence-timeline";
import { AttachmentsSection } from "./attachments-section";
import { CancelRequestModal } from "./cancel-request-modal";
import { CommentsSection } from "./comments-section";
import { DetailSummary } from "./detail-summary";
import { EditRequestForm } from "./edit-request-form";
import { ManagerActions } from "./manager-actions";
import { RatingSection } from "./rating-section";

/**
 * Detalhe da solicitação. As permissões espelham a política do backend, para
 * que a tela nunca ofereça uma ação que a API vai recusar.
 */
export function RequestDetail({ id }: { id: number }) {
  const { token, userId, isManager } = useCurrentUser();

  const [occurrence, setOccurrence] = useState<OccurrenceRecord | null>(null);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [managers, setManagers] = useState<UserRecord[]>([]);
  const [events, setEvents] = useState<OccurrenceEventRecord[]>([]);
  const [comments, setComments] = useState<CommentRecord[]>([]);
  const [attachments, setAttachments] = useState<AttachmentRecord[]>([]);
  const [rating, setRating] = useState<RatingRecord | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const occurrenceData = await getOccurrenceById(token, id);
      setOccurrence(occurrenceData);

      const [categoryData, eventData, commentData, attachmentData] =
        await Promise.all([
          getCategories(token),
          getOccurrenceEvents(token, id),
          getComments(token, id),
          getOccurrenceAttachments(token, id),
        ]);
      setCategories(categoryData.filter((category) => category.active));
      setEvents(eventData);
      setComments(commentData);
      setAttachments(attachmentData);

      setRating(
        occurrenceData.status === "RESOLVED"
          ? await getOccurrenceRating(token, id)
          : null,
      );
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar a solicitação.",
      );
    } finally {
      setLoading(false);
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

  /** Executa a ação, mostra o retorno e recarrega o estado da solicitação. */
  const run = useCallback(
    async (
      action: () => Promise<unknown>,
      successMessage: string,
      fallbackError: string,
    ) => {
      if (!token) return;
      try {
        setSaving(true);
        setError(null);
        await action();
        setNotice(successMessage);
        await load();
      } catch (actionError) {
        setNotice(null);
        setError(
          actionError instanceof Error ? actionError.message : fallbackError,
        );
      } finally {
        setSaving(false);
      }
    },
    [load, token],
  );

  if (loading) return <LoadingState label="Carregando solicitação..." />;

  if (!occurrence)
    return (
      <Container size="md" py={64}>
        <Stack gap="md">
          <ErrorAlert message={error ?? "Solicitação não encontrada."} />
          <Button
            component={Link}
            href="/solicitacoes"
            variant="subtle"
            color="dark"
            leftSection={<IconArrowLeft size={16} />}
            w="fit-content"
          >
            Voltar
          </Button>
        </Stack>
      </Container>
    );

  const isOwner = occurrence.requesterId === userId;
  const isAssignee = occurrence.assigneeId === userId;
  const closed = isFinalStatus(occurrence.status);
  const canEdit =
    (isOwner && occurrence.status === "OPEN") ||
    (isManager && isAssignee && !closed);
  // Solicitante cancela só enquanto aberta; gestor, sendo o responsável.
  const canCancel =
    (isOwner && occurrence.status === "OPEN") ||
    (isManager && isAssignee && !closed);
  const canInteract = !closed;
  const canRate = isOwner && occurrence.status === "RESOLVED" && !rating;
  const backHref = isManager ? "/gestao/solicitacoes" : "/solicitacoes";

  return (
    <main id="conteudo-principal">
      <Container size="md" py={{ base: 24, sm: 48 }}>
        <Stack gap="lg">
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

          <ErrorAlert message={error} />
          <NoticeAlert message={notice} />

          <DetailSummary
            occurrence={occurrence}
            actions={
              canCancel && !isManager ? (
                <Button
                  size="xs"
                  color="red"
                  variant="outline"
                  leftSection={<IconBan size={14} />}
                  onClick={() => setCancelOpen(true)}
                >
                  Cancelar
                </Button>
              ) : undefined
            }
          />

          {isManager && (
            <ManagerActions
              occurrence={occurrence}
              managers={managers}
              currentUserId={userId}
              saving={saving}
              onAssign={(assigneeId) =>
                run(
                  () => assignOccurrence(token, occurrence.id, assigneeId),
                  "Responsável definido.",
                  "Não foi possível definir o responsável.",
                )
              }
              onStatusChange={async (status: OccurrenceStatus, note) =>
                run(
                  async () => {
                    // O backend exige a resolução gravada antes de concluir.
                    if (status === "RESOLVED" && !occurrence.resolution && note) {
                      await updateOccurrence(token, occurrence.id, {
                        resolution: note,
                      });
                    }
                    await changeOccurrenceStatus(
                      token,
                      occurrence.id,
                      status,
                      note,
                    );
                  },
                  "Status atualizado.",
                  "Não foi possível atualizar o status.",
                )
              }
              onPriorityChange={(priority: OccurrencePriority) =>
                run(
                  () =>
                    changeOccurrencePriority(token, occurrence.id, priority),
                  "Prioridade atualizada.",
                  "Não foi possível alterar a prioridade.",
                )
              }
              onCancelRequest={() => setCancelOpen(true)}
            />
          )}

          {canEdit && (
            <EditRequestForm
              occurrence={occurrence}
              categories={categories}
              isManager={isManager}
              onSubmit={(values: EditOccurrenceFormValues) =>
                run(
                  () =>
                    updateOccurrence(token, occurrence.id, {
                      title: values.title,
                      description: values.description,
                      categoryId: Number(values.categoryId),
                      locationText: values.locationText || undefined,
                      locationReference: values.locationReference || undefined,
                      // Prioridade e resolução são exclusivas do gestor
                      // responsável; enviá-las como solicitante dá 403.
                      ...(isManager && values.priority
                        ? {
                            priority: values.priority,
                            resolution: values.resolution || undefined,
                          }
                        : {}),
                    }),
                  "Solicitação atualizada.",
                  "Não foi possível editar a solicitação.",
                )
              }
            />
          )}

          <Card withBorder radius="md">
            <Stack>
              <Title order={2}>Linha do tempo</Title>
              <OccurrenceTimeline events={events} />
            </Stack>
          </Card>

          <AttachmentsSection
            attachments={attachments}
            canAttach={canInteract}
            isClosed={closed}
            onUpload={(file) =>
              run(
                () => uploadAttachment(token, occurrence.id, file),
                "Imagem anexada.",
                "Não foi possível anexar a imagem.",
              )
            }
          />

          <CommentsSection
            comments={comments}
            canComment={canInteract}
            isManager={isManager}
            isClosed={closed}
            onSubmit={(values: CommentFormValues) =>
              run(
                () =>
                  createComment(token, {
                    occurrenceId: occurrence.id,
                    body: values.body,
                    ...(isManager ? { isInternal: values.isInternal } : {}),
                  }),
                "Comentário publicado.",
                "Não foi possível comentar.",
              )
            }
          />

          {occurrence.status === "RESOLVED" && (
            <RatingSection
              rating={rating}
              canRate={canRate}
              onSubmit={(values: RatingFormValues) =>
                run(
                  () =>
                    createRating(token, {
                      occurrenceId: occurrence.id,
                      score: values.score,
                      comment: values.comment || undefined,
                    }),
                  "Avaliação enviada.",
                  "Não foi possível enviar a avaliação.",
                )
              }
            />
          )}
        </Stack>
      </Container>

      <CancelRequestModal
        opened={cancelOpen}
        occurrenceId={occurrence.id}
        onClose={() => setCancelOpen(false)}
        onConfirm={async (reason) => {
          setCancelOpen(false);
          await run(
            () => cancelOccurrence(token, occurrence.id, reason),
            "Solicitação cancelada.",
            "Não foi possível cancelar a solicitação.",
          );
        }}
      />
    </main>
  );
}
