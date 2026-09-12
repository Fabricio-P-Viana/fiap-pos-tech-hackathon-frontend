"use client";

import { NewRequestForm } from "@/components/requests/new-request-form";
import { Protected } from "@/components/shared/protected";

export default function NewRequestPage() {
  return (
    // Abrir solicitação é ação do solicitante; o gestor conduz atendimentos.
    <Protected callbackUrl="/solicitacoes/nova" requesterOnly>
      <NewRequestForm />
    </Protected>
  );
}
