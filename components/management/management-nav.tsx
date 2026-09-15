"use client";

import { Button, Group, ScrollArea } from "@mantine/core";
import {
  IconCategory,
  IconChartBar,
  IconInbox,
  IconUserCheck,
  IconUsers,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  {
    href: "/gestao/solicitacoes",
    label: "Solicitações",
    icon: IconInbox,
  },
  {
    href: "/gestao/meus-atendimentos",
    label: "Meus atendimentos",
    icon: IconUserCheck,
  },
  { href: "/gestao/dashboard", label: "Dashboard", icon: IconChartBar },
  { href: "/gestao/usuarios", label: "Usuários", icon: IconUsers },
  { href: "/gestao/categorias", label: "Categorias", icon: IconCategory },
];

export function ManagementNav() {
  const pathname = usePathname();

  return (
    <ScrollArea type="never" offsetScrollbars={false}>
      <Group gap="xs" wrap="nowrap" component="nav" aria-label="Área de gestão">
        {sections.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Button
              key={href}
              component={Link}
              href={href}
              size="sm"
              color="dark"
              variant={active ? "filled" : "subtle"}
              leftSection={<Icon size={16} />}
              aria-current={active ? "page" : undefined}
            >
              {label}
            </Button>
          );
        })}
      </Group>
    </ScrollArea>
  );
}
