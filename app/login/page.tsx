import LoginForm from "@/components/login";
import RegisterForm from "@/components/register";
import {
  Badge,
  Container,
  Grid,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";

export default function LoginPage() {
  return (
    <main id="conteudo-principal">
      <Container size="lg" py={{ base: 32, sm: 56 }}>
        <Stack gap="lg">
          <Stack gap="sm">
            <Badge variant="default" radius="xl" w="fit-content">
              Acesso
            </Badge>

            <Title order={1} className="auth-page-title">
              Acesse seu espaço no Resolve Aí
            </Title>
            <Text c="dimmed" maw={560}>
              Solicite atendimento, acompanhe ocorrências ou organize a fila da
              sua equipe.
            </Text>
          </Stack>

          <Paper className="auth-page-card" p={{ base: "lg", sm: "xl" }}>
            <Grid>
              <LoginForm />
              <RegisterForm />
            </Grid>
          </Paper>
        </Stack>
      </Container>
    </main>
  );
}
