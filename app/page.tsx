import {
  Badge,
  Button,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconArrowRight,
  IconClipboardText,
  IconMapPin,
  IconShieldCheck,
} from "@tabler/icons-react";

export default function Home() {
  return (
    <main id="conteudo-principal">
      <Container size="lg" py={{ base: 32, sm: 64 }}>
        <Stack gap={48}>
          <Paper className="home-hero" p={{ base: "xl", sm: 52 }} withBorder>
            <Stack gap="lg" maw={720}>
              <Badge variant="light" color="dark" w="fit-content">
                Gestão simples, resposta mais rápida
              </Badge>
              <Title order={1} className="home-title">
                O problema acontece. A solução começa aqui.
              </Title>
              <Text size="lg" c="dimmed" maw={620}>
                Registre solicitações, acompanhe cada etapa e mantenha sua
                comunidade informada em um único lugar.
              </Text>
              <Group gap="sm">
                <Button
                  component="a"
                  href="/login"
                  rightSection={<IconArrowRight size={16} />}
                >
                  Entrar na plataforma
                </Button>
                <Button
                  component="a"
                  href="/login"
                  variant="subtle"
                  color="dark"
                >
                  Criar conta
                </Button>
              </Group>
            </Stack>
          </Paper>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Paper p="lg" withBorder>
              <ThemeIcon variant="light" color="dark" mb="md">
                <IconClipboardText size={20} />
              </ThemeIcon>
              <Title order={3}>Registre</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Descreva o que precisa de atenção e indique o local.
              </Text>
            </Paper>
            <Paper p="lg" withBorder>
              <ThemeIcon variant="light" color="dark" mb="md">
                <IconMapPin size={20} />
              </ThemeIcon>
              <Title order={3}>Acompanhe</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Veja o andamento da solicitação sem depender de mensagens
                soltas.
              </Text>
            </Paper>
            <Paper p="lg" withBorder>
              <ThemeIcon variant="light" color="dark" mb="md">
                <IconShieldCheck size={20} />
              </ThemeIcon>
              <Title order={3}>Resolva</Title>
              <Text size="sm" c="dimmed" mt="xs">
                Gestores organizam prioridades e conduzem cada atendimento.
              </Text>
            </Paper>
          </SimpleGrid>
        </Stack>
      </Container>
    </main>
  );
}
