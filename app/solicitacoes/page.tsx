"use client";

import { Suspense } from "react";
import { RequestList } from "@/components/requests/request-list";
import { LoadingState } from "@/components/shared/feedback";
import { Protected } from "@/components/shared/protected";

export default function RequestsPage() {
  return (
    <Protected callbackUrl="/solicitacoes">
      {/* useSearchParams exige limite de suspense para o pré-render. */}
      <Suspense fallback={<LoadingState />}>
        <RequestList />
      </Suspense>
    </Protected>
  );
}
