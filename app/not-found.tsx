import {
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { IconHome2 } from "@tabler/icons-react";
import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main id="conteudo-principal" className="status-page-main">
      <Container size="md" py={{ base: 32, sm: 56 }}>
        <Paper className="status-page-card" p={{ base: "lg", sm: "xl" }}>
          <Stack gap="lg">
            <Text className="status-page-code" aria-label="Erro 404">
              [404]
            </Text>

            <Stack gap="xs">
              <Title order={1} className="status-page-title">
                Pagina nao encontrada
              </Title>
              <Text c="gray-filled-hover" className="status-page-description">
                Este recado nao existe ou foi removido. Verifique o link ou
                volte para a listagem.
              </Text>
            </Stack>

            <Group gap="sm" wrap="wrap">
              <Link href="/" prefetch={true} style={{ textDecoration: "none" }}>
                <Button
                  component="span"
                  variant="filled"
                  color="dark"
                  radius="xl"
                  leftSection={<IconHome2 size={16} />}
                >
                  Ir para home
                </Button>
              </Link>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </main>
  );
}
