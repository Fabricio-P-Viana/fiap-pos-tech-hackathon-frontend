"use client";

import { Suspense } from "react";
import { ManagementRequestList } from "@/components/management/requests/management-request-list";
import { LoadingState } from "@/components/shared/feedback";

export default function ManagementRequestsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ManagementRequestList />
    </Suspense>
  );
}
