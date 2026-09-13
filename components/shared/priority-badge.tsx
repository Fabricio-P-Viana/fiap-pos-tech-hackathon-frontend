import { Badge } from "@mantine/core";
import type { OccurrencePriority } from "@/types/resolve-ai";
import { priorityLabels } from "@/types/resolve-ai";
import { priorityColors } from "@/lib/occurrence";

export function PriorityBadge({
  priority,
  size = "sm",
}: {
  priority: OccurrencePriority;
  size?: string;
}) {
  return (
    <Badge color={priorityColors[priority]} size={size} variant="outline">
      {priorityLabels[priority]}
    </Badge>
  );
}
