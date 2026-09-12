"use client";

import { useSession } from "next-auth/react";

/**
 * Centraliza a leitura da sessão: token, id e perfil do usuário, além dos
 * estados de carregamento/autenticação usados pelas páginas protegidas.
 */
export function useCurrentUser() {
  const { data: session, status } = useSession();
  const userId = Number(session?.user?.id);

  return {
    token: session?.accessToken,
    userId: Number.isInteger(userId) ? userId : undefined,
    name: session?.user?.name ?? undefined,
    role: session?.user?.role ?? "REQUESTER",
    isManager: session?.user?.role === "MANAGER",
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    isUnauthenticated: status === "unauthenticated",
  };
}
