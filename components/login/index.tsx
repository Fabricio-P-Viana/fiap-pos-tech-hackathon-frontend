"use client";

import {
  Button,
  Divider,
  GridCol,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconArrowRight, IconLock } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type LoginFormValues, loginSchema } from "@/schemas/auth";

const LoginForm = () => {
  const router = useRouter();
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    const callbackUrl =
      typeof window === "undefined"
        ? "/"
        : (new URLSearchParams(window.location.search).get("callbackUrl") ??
          "/");

    setSubmitError(null);
    setSubmitMessage(null);

    const result = await signIn("credentials", {
      email: values.email,
      password: values.password,
      callbackUrl,
      redirect: false,
    });

    if (!result) {
      setSubmitError("Nao foi possivel iniciar sessao no momento.");
      return;
    }

    if (result.error) {
      setSubmitError("Email ou senha invalidos.");
      return;
    }

    setSubmitMessage("Login realizado com sucesso.");
    reset({ email: values.email, password: "" });
    router.push(result.url ?? "/");
    router.refresh();
  };

  return (
    <GridCol span={{ base: 12, md: 6 }}>
      <Stack gap="md" className="auth-panel">
        <Group justify="space-between" align="center">
          <Text fw={700} fz="lg">
            Entrar
          </Text>
          <IconLock size={18} aria-hidden />
        </Group>

        <Text size="sm" c="gray-filled-hover">
          Acesse para ver os recados e avisos dos professores.
        </Text>

        <Divider />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap="sm">
            <TextInput
              label="Email"
              type="email"
              id="login-email"
              autoComplete="email"
              placeholder="voce@fiap.com.br"
              error={errors.email?.message}
              {...register("email")}
            />

            <PasswordInput
              label="Senha"
              id="login-password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              error={errors.password?.message}
              {...register("password")}
            />

            {submitError ? (
              <Text size="sm" c="red.7" role="alert" aria-live="polite">
                {submitError}
              </Text>
            ) : null}

            {submitMessage ? (
              <Text size="sm" c="teal.8" role="status" aria-live="polite">
                {submitMessage}
              </Text>
            ) : null}

            <Button
              type="submit"
              variant="filled"
              color="dark"
              radius="xl"
              rightSection={<IconArrowRight size={16} />}
              loading={isSubmitting}
            >
              Entrar agora
            </Button>
          </Stack>
        </form>
      </Stack>
    </GridCol>
  );
};

export default LoginForm;
