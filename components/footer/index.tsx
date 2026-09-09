import { Container, Group, Stack, Text } from "@mantine/core";
import Link from "next/link";

export function HomeFooter() {
  return (
    <footer className="site-footer">
      <Container size="lg" py="xl">
        <Stack gap="lg">
          <Group justify="space-between" align="start">
            <Stack gap={4}>
              <Text
                ff="var(--font-ibm-plex-mono), monospace"
                fw={700}
                size="lg"
              >
                Resolve Aí
              </Text>
              <Text size="sm" c="gray-filled-hover">
                Plataforma de gestão de ocorrências.
              </Text>
            </Stack>

            <Stack gap={8}>
              <Text fw={700} size="sm" c="gray-filled-hover" tt="uppercase">
                Navegação
              </Text>
              <Link href="/" className="footer-link">
                Inicio
              </Link>
              <Link href="/login" className="footer-link">
                Login
              </Link>
            </Stack>
          </Group>

          <Group justify="space-between" align="center">
            <Text size="xs" c="gray-filled-hover">
              Projeto academico FIAP Pos Tech Fase 3 - 2026
            </Text>
            <Text size="xs" c="gray-filled-hover">
              Desenvolvido por{" "}
              <Link
                href="https://fabricio.vercel.app"
                className="footer-link"
                target="_blank"
                rel="noreferrer"
              >
                Fabricio Viana
              </Link>{" "}
              - RM 369372
            </Text>
          </Group>
        </Stack>
      </Container>
    </footer>
  );
}
