"use client";

import { Container, Text } from "@mantine/core";
import { useParams } from "next/navigation";
import { RequestDetail } from "@/components/requests/detail/request-detail";
import { Protected } from "@/components/shared/protected";

export default function RequestDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  if (!Number.isInteger(id) || id <= 0)
    return (
      <Container size="md" py={64}>
        <Text c="dimmed">Solicitação inválida.</Text>
      </Container>
    );

  return (
    <Protected callbackUrl={`/solicitacoes/${params.id}`}>
      <RequestDetail id={id} />
    </Protected>
  );
}
