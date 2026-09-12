"use client";

import {
  Button,
  Card,
  Container,
  FileInput,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconPhoto,
  IconSend,
} from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  createOccurrence,
  getCategories,
  uploadAttachment,
} from "@/services/resolve-ai";
import type { CategoryRecord } from "@/types/resolve-ai";
import {
  createOccurrenceSchema,
  type CreateOccurrenceFormValues,
} from "@/schemas/occurrence";
import { priorityOptions } from "@/lib/occurrence";
import { useCurrentUser } from "@/lib/use-current-user";
import {
  ErrorAlert,
  LoadingState,
  NoticeAlert,
} from "@/components/shared/feedback";
import { PageHeader } from "@/components/shared/page-header";

/** Tela dedicada de abertura de solicitação, já com anexo de foto. */
export function NewRequestForm() {
  const router = useRouter();
  const { token } = useCurrentUser();
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateOccurrenceFormValues>({
    resolver: zodResolver(createOccurrenceSchema),
    mode: "onBlur",
    defaultValues: {
      categoryId: "",
      title: "",
      description: "",
      priority: "MEDIUM",
      locationText: "",
      locationReference: "",
      photo: null,
    },
  });

  const load = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getCategories(token);
      setCategories(data.filter((category) => category.active));
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

  const onSubmit = async (values: CreateOccurrenceFormValues) => {
    if (!token) return;
    setError(null);
    try {
      const occurrence = await createOccurrence(token, {
        categoryId: Number(values.categoryId),
        title: values.title,
        description: values.description,
        priority: values.priority,
        locationText: values.locationText || undefined,
        locationReference: values.locationReference || undefined,
      });

      // A imagem só pode ser enviada depois que a solicitação existe. Se o
      // upload falhar, a solicitação já está aberta — avisamos sem perdê-la.
      if (values.photo) {
        try {
          await uploadAttachment(token, occurrence.id, values.photo);
        } catch (uploadError) {
          setNotice(
            `Solicitação #${occurrence.id} aberta, mas a imagem não foi enviada: ${
              uploadError instanceof Error
                ? uploadError.message
                : "falha no upload"
            }. Você pode anexá-la na página da solicitação.`,
          );
          router.push(`/solicitacoes/${occurrence.id}`);
          return;
        }
      }

      router.push(`/solicitacoes/${occurrence.id}`);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível abrir a solicitação.",
      );
    }
  };

  if (loading) return <LoadingState label="Preparando o formulário..." />;

  return (
    <main id="conteudo-principal">
      <Container size="md" py={{ base: 32, sm: 48 }}>
        <Stack gap="lg">
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

          <PageHeader
            eyebrow="Nova solicitação"
            title="Abra uma solicitação"
            description="Descreva o problema com clareza e, se possível, anexe uma foto — isso acelera o atendimento."
          />

          <ErrorAlert message={error} />
          <NoticeAlert message={notice} />

          <Card withBorder radius="md" p="xl">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <Stack gap="md">
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select
                      label="Categoria"
                      placeholder="Selecione uma categoria"
                      data={categories.map((category) => ({
                        value: String(category.id),
                        label: category.name,
                      }))}
                      error={errors.categoryId?.message}
                      value={field.value}
                      onChange={(value) => field.onChange(value ?? "")}
                      onBlur={field.onBlur}
                      searchable
                    />
                  )}
                />

                <TextInput
                  label="Título"
                  placeholder="Ex.: vazamento no corredor"
                  error={errors.title?.message}
                  {...register("title")}
                />

                <Textarea
                  label="Descrição"
                  placeholder="Conte o que aconteceu, desde quando e o que já tentou"
                  minRows={5}
                  autosize
                  error={errors.description?.message}
                  {...register("description")}
                />

                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      label="Prioridade"
                      data={priorityOptions}
                      error={errors.priority?.message}
                      value={field.value}
                      onChange={(value) =>
                        field.onChange(value ?? "MEDIUM")
                      }
                      onBlur={field.onBlur}
                    />
                  )}
                />

                <TextInput
                  label="Local"
                  placeholder="Ex.: Bloco A, corredor 2"
                  error={errors.locationText?.message}
                  {...register("locationText")}
                />

                <TextInput
                  label="Referência"
                  placeholder="Ex.: ao lado do elevador"
                  error={errors.locationReference?.message}
                  {...register("locationReference")}
                />

                <Controller
                  control={control}
                  name="photo"
                  render={({ field }) => (
                    <Stack gap={4}>
                      <FileInput
                        label="Foto (opcional)"
                        placeholder="Selecione uma imagem"
                        accept="image/png,image/jpeg,image/webp"
                        leftSection={<IconPhoto size={16} />}
                        clearable
                        error={errors.photo?.message}
                        value={field.value ?? null}
                        onChange={field.onChange}
                      />
                      <Text size="xs" c="dimmed">
                        JPEG, PNG ou WebP, até 5MB.
                      </Text>
                    </Stack>
                  )}
                />

                <Group justify="end">
                  <Button
                    component={Link}
                    href="/solicitacoes"
                    variant="subtle"
                    color="dark"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    leftSection={<IconSend size={16} />}
                    loading={isSubmitting}
                  >
                    Enviar solicitação
                  </Button>
                </Group>
              </Stack>
            </form>
          </Card>
        </Stack>
      </Container>
    </main>
  );
}
