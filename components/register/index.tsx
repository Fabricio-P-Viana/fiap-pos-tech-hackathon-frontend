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
import { IconArrowRight, IconUserPlus } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { type RegisterFormValues, registerSchema } from "@/schemas/auth";

const RegisterForm = () => {
  const router = useRouter();
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const callbackUrl =
      typeof window === "undefined"
        ? "/"
        : (new URLSearchParams(window.location.search).get("callbackUrl") ??
          "/");

    setSubmitError(null);
    setSubmitMessage(null);

    try {
      await axios.post("/api/auth/register", values);

      const signInResult = await signIn("credentials", {
        email: values.email,
        password: values.password,
        callbackUrl,
        redirect: false,
      });

      if (!signInResult || signInResult.error) {
        setSubmitMessage(
          "Cadastro concluido com sucesso. Faca login para continuar.",
        );
        reset({
          name: "",
          email: values.email,
          password: "",
          passwordConfirm: "",
        });
        return;
      }

      setSubmitMessage("Conta criada e login realizado com sucesso.");
      reset({
        name: "",
        email: values.email,
        password: "",
        passwordConfirm: "",
      });
      router.push(signInResult.url ?? "/");
      router.refresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          (error.response?.data as { message?: string } | undefined)?.message ??
          "Nao foi possivel concluir o cadastro.";
        setSubmitError(message);
        return;
      }

      setSubmitError("Nao foi possivel concluir o cadastro.");
    }
  };

  return (
    <GridCol span={{ base: 12, md: 6 }}>
      <Stack gap="md" className="auth-panel auth-panel-register">
        <Group justify="space-between" align="center">
          <Text fw={700} fz="lg">
            Registrar-se
          </Text>
          <IconUserPlus size={18} aria-hidden />
        </Group>

        <Text size="sm" c="gray-filled-hover">
          Crie seu cadastro
        </Text>

        <Divider />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Stack gap="sm">
            <TextInput
              label="Nome completo"
              id="register-name"
              autoComplete="name"
              placeholder="Seu nome"
              error={errors.name?.message}
              {...register("name")}
            />

            <TextInput
              label="Email"
              type="email"
              id="register-email"
              autoComplete="email"
              placeholder="voce@fiap.com.br"
              error={errors.email?.message}
              {...register("email")}
            />

            <PasswordInput
              label="Senha"
              id="register-password"
              autoComplete="new-password"
              placeholder="Crie uma senha"
              error={errors.password?.message}
              {...register("password")}
            />

            <PasswordInput
              label="Confirmar senha"
              id="register-password-confirm"
              autoComplete="new-password"
              placeholder="Repita sua senha"
              error={errors.passwordConfirm?.message}
              {...register("passwordConfirm")}
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
              variant="light"
              color="dark"
              radius="xl"
              rightSection={<IconArrowRight size={16} />}
              loading={isSubmitting}
            >
              Criar conta
            </Button>
          </Stack>
        </form>
      </Stack>
    </GridCol>
  );
};

export default RegisterForm;
