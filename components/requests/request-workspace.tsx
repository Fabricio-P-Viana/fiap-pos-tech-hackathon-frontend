"use client";

import {
  Alert,
  Badge,
  Button,
  Card,
  Container,
  Group,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { IconAlertCircle, IconSend } from "@tabler/icons-react";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createOccurrence,
  getCategories,
  getOccurrences,
} from "@/services/resolve-ai";
import type { CategoryRecord, OccurrenceRecord } from "@/types/resolve-ai";
import { priorityLabels, statusLabels } from "@/types/resolve-ai";

const priorityOptions = Object.entries(priorityLabels).map(
  ([value, label]) => ({ value, label }),
);

export function RequestWorkspace() {
  const { data: session, status: sessionStatus } = useSession();
  const token = session?.accessToken;
  const currentUserId = Number(session?.user?.id);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [occurrences, setOccurrences] = useState<OccurrenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    categoryId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    locationText: "",
    locationReference: "",
  });

  const ownOccurrences = useMemo(
    () =>
      occurrences.filter(
        (occurrence) => occurrence.requesterId === currentUserId,
      ),
    [occurrences, currentUserId],
  );

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [categoryData, occurrenceData] = await Promise.all([
        getCategories(token),
        getOccurrences(token),
      ]);
      setCategories(categoryData.filter((category) => category.active));
      setOccurrences(occurrenceData);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar as solicitações.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    try {
      setSubmitting(true);
      setError(null);
      await createOccurrence(token, {
        ...form,
        categoryId: Number(form.categoryId),
      });
      setForm({
        categoryId: "",
        title: "",
        description: "",
        priority: "MEDIUM",
        locationText: "",
        locationReference: "",
      });
      setSuccess("Solicitação aberta com sucesso.");
      await loadData();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível abrir a solicitação.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (sessionStatus === "loading" || loading)
    return (
      <Container size="lg" py={64}>
        <Text c="dimmed">Carregando sua área...</Text>
      </Container>
    );

  return (
    <main id="conteudo-principal">
      <Container size="lg" py={{ base: 32, sm: 56 }}>
        <Stack gap="xl">
          <Stack gap={4}>
            <Text className="eyebrow">Área do solicitante</Text>
            <Title order={1}>Abra uma solicitação</Title>
            <Text c="dimmed" maw={650}>
              Descreva o problema com clareza. A equipe responsável acompanhará
              a evolução por aqui.
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
          {success && (
            <Alert color="teal" title="Tudo certo">
              {success}
            </Alert>
          )}
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Card withBorder radius="md" p="xl">
              <form onSubmit={handleSubmit}>
                <Stack gap="md">
                  <Select
                    label="Categoria"
                    placeholder="Selecione uma categoria"
                    data={categories.map((category) => ({
                      value: String(category.id),
                      label: category.name,
                    }))}
                    value={form.categoryId}
                    onChange={(value) =>
                      setForm({ ...form, categoryId: value ?? "" })
                    }
                    required
                  />
                  <TextInput
                    label="Título"
                    placeholder="Ex.: vazamento no corredor"
                    value={form.title}
                    onChange={(event) =>
                      setForm({ ...form, title: event.currentTarget.value })
                    }
                    required
                  />
                  <Textarea
                    label="Descrição"
                    placeholder="Conte o que aconteceu"
                    minRows={5}
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.currentTarget.value,
                      })
                    }
                    required
                  />
                  <Select
                    label="Prioridade"
                    data={priorityOptions}
                    value={form.priority}
                    onChange={(value) =>
                      setForm({ ...form, priority: value ?? "MEDIUM" })
                    }
                    required
                  />
                  <TextInput
                    label="Local"
                    placeholder="Ex.: Bloco A, corredor 2"
                    value={form.locationText}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        locationText: event.currentTarget.value,
                      })
                    }
                  />
                  <TextInput
                    label="Referência"
                    placeholder="Ex.: ao lado do elevador"
                    value={form.locationReference}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        locationReference: event.currentTarget.value,
                      })
                    }
                  />
                  <Button
                    type="submit"
                    leftSection={<IconSend size={16} />}
                    loading={submitting}
                  >
                    Enviar solicitação
                  </Button>
                </Stack>
              </form>
            </Card>
            <Stack gap="md">
              <Group justify="space-between">
                <Title order={3}>Minhas solicitações</Title>
                <Badge variant="light">{ownOccurrences.length}</Badge>
              </Group>
              {ownOccurrences.length === 0 ? (
                <Card withBorder>
                  <Text c="dimmed">Você ainda não abriu solicitações.</Text>
                </Card>
              ) : (
                ownOccurrences.map((occurrence) => (
                  <Card key={occurrence.id} withBorder radius="md">
                    <Stack gap="xs">
                      <Group justify="space-between" align="start">
                        <Text fw={700}>{occurrence.title}</Text>
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
                      <Text size="sm" c="dimmed" lineClamp={2}>
                        {occurrence.description}
                      </Text>
                      <Group gap="xs">
                        <Badge variant="outline">
                          {priorityLabels[occurrence.priority]}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          #{occurrence.id}
                        </Text>
                      </Group>
                    </Stack>
                  </Card>
                ))
              )}
            </Stack>
          </SimpleGrid>
        </Stack>
      </Container>
    </main>
  );
}
