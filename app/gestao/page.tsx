"use client";

import { Center, Loader } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ManagementWorkspace } from "@/components/management/management-workspace";

export default function ManagementPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isManager = session?.user?.role === "MANAGER";

  useEffect(() => {
    if (status === "unauthenticated")
      router.replace("/login?callbackUrl=/gestao");
    if (status === "authenticated" && !isManager)
      router.replace("/solicitacoes");
  }, [isManager, router, status]);

  if (status !== "authenticated" || !isManager)
    return (
      <Center mih="60vh">
        <Loader color="dark" />
      </Center>
    );
  return <ManagementWorkspace />;
}
