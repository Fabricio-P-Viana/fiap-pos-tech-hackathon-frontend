"use client";

import { useEffect } from "react";
import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconRotateClockwise, IconHome2 } from "@tabler/icons-react";
import Link from "next/link";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset?: () => void;
  unstable_retry?: () => void;
};

export default function ErrorPage({
  error,
  reset,
  unstable_retry,
}: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = unstable_retry ?? reset;

  return (
    <main id="conteudo-principal" className="status-page-main">
      <Container size="md" py={{ base: 32, sm: 56 }}>
        <Paper className="status-page-card" p={{ base: "lg", sm: "xl" }}>
          <Stack gap="lg">
            <Text className="status-page-code" aria-label="Erro 500">
              [500]
            </Text>

            <Stack gap="xs">
              <Title order={1} className="status-page-title">
                Ocorreu um erro inesperado
              </Title>
              <Text c="gray-filled-hover" className="status-page-description">
                Tivemos um problema ao carregar esta pagina. Tente novamente ou
                volte para a home.
              </Text>
            </Stack>

            {error.digest ? (
              <Text
                className="status-page-digest"
                aria-label="Codigo interno do erro"
              >
                digest: {error.digest}
              </Text>
            ) : null}

            <Group gap="sm" wrap="wrap">
              {retry ? (
                <Button
                  variant="filled"
                  color="dark"
                  radius="xl"
                  leftSection={<IconRotateClockwise size={16} />}
                  onClick={() => retry()}
                >
                  Tentar novamente
                </Button>
              ) : null}

              <Link href="/" prefetch={true} style={{ textDecoration: "none" }}>
                <Button
                  component="span"
                  variant="light"
                  color="dark"
                  radius="xl"
                  leftSection={<IconHome2 size={16} />}
                >
                  Voltar para home
                </Button>
              </Link>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </main>
  );
}
