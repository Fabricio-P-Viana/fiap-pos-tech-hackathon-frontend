import { Badge } from "@mantine/core";
import type { OccurrenceStatus } from "@/types/resolve-ai";
import { statusLabels } from "@/types/resolve-ai";
import { statusColors } from "@/lib/occurrence";

export function StatusBadge({
  status,
  size = "sm",
}: {
  status: OccurrenceStatus;
  size?: string;
}) {
  return (
    <Badge color={statusColors[status]} size={size} variant="light">
      {statusLabels[status]}
    </Badge>
  );
}
