"use client";

import {
  Avatar,
  Button,
  Container,
  Group,
  Menu,
  Skeleton,
  Text,
  UnstyledButton,
} from "@mantine/core";
import {
  IconClipboardText,
  IconLogout,
  IconHome,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";

export function FixedHeader() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name ?? "usuario";
  const userRole = session?.user?.role ?? "REQUESTER";
  const isManager = userRole === "MANAGER";

  const userInitials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name.charAt(0).toUpperCase())
    .join("");

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <header className="site-header">
      <Container size="lg" py="sm">
        <Group justify="space-between" align="center" wrap="nowrap">
          <Button
            component={Link}
            href="/"
            variant="subtle"
            color="gray"
            size="sm"
          >
            <Text
              ff="var(--font-ibm-plex-mono), monospace"
              fw={700}
              tt="uppercase"
              size="md"
              c="inherit"
            >
              Resolve Aí
            </Text>
          </Button>

          <Group gap="md" align="center" wrap="wrap" justify="end">
            <Button
              component={Link}
              href="/"
              variant="subtle"
              color="gray"
              size="sm"
              hiddenFrom="md"
              hidden
            >
              Inicio
            </Button>

            {status === "loading" ? (
              <Group
                gap="sm"
                align="center"
                aria-label="Carregando perfil do usuário"
              >
                <Skeleton height={16} width={80} aria-hidden="true" />
                <Skeleton height={32} circle aria-hidden="true" />
              </Group>
            ) : status === "authenticated" ? (
              <>
                <Button
                  component={Link}
                  href="/"
                  variant="subtle"
                  color="gray"
                  size="sm"
                  visibleFrom="md"
                >
                  Inicio
                </Button>
                {!isManager && (
                  <Button
                    component={Link}
                    href="/solicitacoes"
                    variant="subtle"
                    color="gray"
                    size="sm"
                    leftSection={<IconClipboardText size={16} />}
                    visibleFrom="md"
                  >
                    Solicitações
                  </Button>
                )}

                {isManager && (
                  <Button
                    component={Link}
                    href="/gestao/solicitacoes"
                    variant="subtle"
                    color="gray"
                    size="sm"
                    leftSection={<IconSettings size={16} />}
                    visibleFrom="md"
                  >
                    Gestão
                  </Button>
                )}

                <Menu
                  shadow="md"
                  width={220}
                  position="bottom-end"
                  offset={8}
                  withinPortal
                  zIndex={1001}
                >
                  <Menu.Target>
                    <UnstyledButton
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                      }}
                      aria-label={`Menu do usuário ${userName}`}
                      aria-haspopup="menu"
                    >
                      <Avatar
                        color="dark"
                        variant="light"
                        radius="xl"
                        size="sm"
                        aria-label={`Avatar do usuário ${userName}`}
                        title={`Avatar do usuário ${userName}`}
                      >
                        {userInitials || "U"}
                      </Avatar>
                      <Text size="sm" fw={500} lineClamp={1} visibleFrom="md">
                        {userName}
                      </Text>
                    </UnstyledButton>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Item disabled>
                      <Text size="xs" c="gray.7" fw={600}>
                        {userName}
                      </Text>
                      <Text size="xs" c="gray.5">
                        {isManager ? "Gestor" : "Solicitante"}
                      </Text>
                    </Menu.Item>

                    <Menu.Divider hiddenFrom="md" />

                    <Menu.Item
                      component={Link}
                      href="/"
                      leftSection={<IconHome size={14} />}
                      hiddenFrom="md"
                    >
                      Inicio
                    </Menu.Item>

                    {!isManager && (
                      <Menu.Item
                        component={Link}
                        href="/solicitacoes"
                        leftSection={<IconClipboardText size={14} />}
                        hiddenFrom="md"
                      >
                        Solicitações
                      </Menu.Item>
                    )}

                    {isManager && (
                      <Menu.Item
                        component={Link}
                        href="/gestao/solicitacoes"
                        leftSection={<IconSettings size={14} />}
                        hiddenFrom="md"
                      >
                        Gestão
                      </Menu.Item>
                    )}

                    <Menu.Divider />
                    <Menu.Item
                      onClick={() => {
                        handleSignOut();
                      }}
                      color="red"
                      leftSection={<IconLogout size={14} />}
                    >
                      Sair
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </>
            ) : (
              <Button
                component={Link}
                href="/login"
                size="sm"
                aria-label="Ir para página de login"
              >
                Login
              </Button>
            )}
          </Group>
        </Group>
      </Container>
    </header>
  );
}
