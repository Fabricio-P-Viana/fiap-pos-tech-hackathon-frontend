import { Button, Container, Paper, Stack, Text, Title } from "@mantine/core";

export default function Home() {
  return (
    <main id="conteudo-principal">
      <Container size="lg" py={{ base: 40, sm: 72 }}>
        <Paper p={{ base: "xl", sm: 48 }} withBorder>
          <Stack gap="md" maw={680}>
            <Text size="sm" tt="uppercase" fw={700} c="dimmed">
              Resolve Aí
            </Text>
            <Title order={1}>Gestão de ocorrências</Title>
            <Text size="lg" c="dimmed">
              A base do portal está pronta. Em breve você poderá registrar,
              acompanhar e resolver ocorrências por aqui.
            </Text>
            <Button component="a" href="/login" w="fit-content">
              Acessar conta
            </Button>
          </Stack>
        </Paper>
      </Container>
    </main>
  );
}
