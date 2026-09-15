"use client";

import { Anchor, Card, Table, Text } from "@mantine/core";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { OccurrenceRecord } from "@/types/resolve-ai";
import { assigneeLabel, formatRelative, requesterLabel } from "@/lib/occurrence";
import { PriorityBadge } from "./priority-badge";
import { StatusBadge } from "./status-badge";

export function OccurrenceTable({
  occurrences,
  showRequester = false,
  showAssignee = false,
}: {
  occurrences: OccurrenceRecord[];
  showRequester?: boolean;
  showAssignee?: boolean;
}) {
  const router = useRouter();

  return (
    <Card withBorder radius="md" p={0} style={{ overflowX: "auto" }}>
      <Table striped highlightOnHover verticalSpacing="sm" miw={680}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th w={70}>#</Table.Th>
            <Table.Th>Título</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Prioridade</Table.Th>
            {showRequester && <Table.Th>Solicitante</Table.Th>}
            {showAssignee && <Table.Th>Responsável</Table.Th>}
            <Table.Th>Aberta</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {occurrences.map((occurrence) => {
            const href = `/solicitacoes/${occurrence.id}`;
            return (
              <Table.Tr
                key={occurrence.id}
                onClick={() => router.push(href)}
                style={{ cursor: "pointer" }}
              >
                <Table.Td>
                  <Text size="sm" c="dimmed">
                    {occurrence.id}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Anchor
                    component={Link}
                    href={href}
                    c="dark"
                    fw={600}
                    size="sm"
                    lineClamp={1}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {occurrence.title}
                  </Anchor>
                  {occurrence.categoryName && (
                    <Text size="xs" c="dimmed" lineClamp={1}>
                      {occurrence.categoryName}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={occurrence.status} />
                </Table.Td>
                <Table.Td>
                  <PriorityBadge priority={occurrence.priority} />
                </Table.Td>
                {showRequester && (
                  <Table.Td>
                    <Text size="sm" lineClamp={1}>
                      {requesterLabel(occurrence)}
                    </Text>
                  </Table.Td>
                )}
                {showAssignee && (
                  <Table.Td>
                    <Text
                      size="sm"
                      lineClamp={1}
                      c={occurrence.assigneeId ? undefined : "dimmed"}
                    >
                      {assigneeLabel(occurrence)}
                    </Text>
                  </Table.Td>
                )}
                <Table.Td>
                  <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
                    {formatRelative(occurrence.createdAt)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Card>
  );
}
