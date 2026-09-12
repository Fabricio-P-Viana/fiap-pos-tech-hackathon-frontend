"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useCurrentUser } from "@/lib/use-current-user";
import { LoadingState } from "./feedback";

/**
 * Guarda de rota: manda quem não está autenticado para o login (voltando
 * depois para a página pedida) e, quando "managerOnly", devolve o solicitante
 * para a área dele.
 */
export function Protected({
  callbackUrl,
  managerOnly = false,
  requesterOnly = false,
  children,
}: {
  callbackUrl: string;
  managerOnly?: boolean;
  /** Telas exclusivas do solicitante, como a abertura de solicitação. */
  requesterOnly?: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isUnauthenticated, isManager } = useCurrentUser();

  useEffect(() => {
    if (isUnauthenticated) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    if (isAuthenticated && managerOnly && !isManager) {
      router.replace("/solicitacoes");
      return;
    }
    if (isAuthenticated && requesterOnly && isManager) {
      router.replace("/gestao/solicitacoes");
    }
  }, [
    callbackUrl,
    isAuthenticated,
    isManager,
    isUnauthenticated,
    managerOnly,
    requesterOnly,
    router,
  ]);

  if (
    !isAuthenticated ||
    (managerOnly && !isManager) ||
    (requesterOnly && isManager)
  )
    return <LoadingState />;

  return <>{children}</>;
}
