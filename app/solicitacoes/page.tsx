"use client";

import { Center, Loader } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { RequestWorkspace } from "@/components/requests/request-workspace";

export default function RequestsPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated")
      router.replace("/login?callbackUrl=/solicitacoes");
  }, [router, status]);

  if (status !== "authenticated")
    return (
      <Center mih="60vh">
        <Loader color="dark" />
      </Center>
    );
  return <RequestWorkspace />;
}
