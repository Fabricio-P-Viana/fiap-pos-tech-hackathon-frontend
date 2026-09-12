"use client";

import { LandingHero } from "@/components/home/landing-hero";
import { ManagerHome } from "@/components/home/manager-home";
import { RequesterHome } from "@/components/home/requester-home";
import { LoadingState } from "@/components/shared/feedback";
import { useCurrentUser } from "@/lib/use-current-user";

/**
 * A apresentação da plataforma só serve para quem não está logado; autenticado,
 * a home vira o resumo da conta — do solicitante ou do gestor.
 */
export default function Home() {
  const { isLoading, isAuthenticated, isManager } = useCurrentUser();

  return (
    <main id="conteudo-principal">
      {isLoading ? (
        <LoadingState />
      ) : !isAuthenticated ? (
        <LandingHero />
      ) : isManager ? (
        <ManagerHome />
      ) : (
        <RequesterHome />
      )}
    </main>
  );
}
