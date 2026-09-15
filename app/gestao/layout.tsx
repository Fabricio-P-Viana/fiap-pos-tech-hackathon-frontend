"use client";

import { Container, Divider, Stack } from "@mantine/core";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ManagementNav } from "@/components/management/management-nav";
import { Protected } from "@/components/shared/protected";

export default function ManagementLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <Protected callbackUrl={pathname} managerOnly>
      <main id="conteudo-principal">
        <Container size="lg" py={{ base: 24, sm: 40 }}>
          <Stack gap="lg">
            <ManagementNav />
            <Divider />
            {children}
          </Stack>
        </Container>
      </main>
    </Protected>
  );
}
