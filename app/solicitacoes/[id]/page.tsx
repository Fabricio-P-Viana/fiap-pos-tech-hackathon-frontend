"use client";

import { Center, Loader } from "@mantine/core";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { RequestDetail } from "@/components/requests/request-detail";

export default function RequestDetailPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  useEffect(() => {
    if (status === "unauthenticated")
      router.replace(`/login?callbackUrl=/solicitacoes/${params.id}`);
  }, [params.id, router, status]);

  if (status !== "authenticated" || !Number.isInteger(id))
    return (
      <Center mih="60vh">
        <Loader color="dark" />
      </Center>
    );
  return <RequestDetail id={id} />;
}
