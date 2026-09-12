import { Card, SimpleGrid, Text, Title } from "@mantine/core";

export type SummaryTile = {
  label: string;
  value: string | number;
  hint?: string;
};

export function SummaryTiles({ tiles }: { tiles: SummaryTile[] }) {
  return (
    <SimpleGrid cols={{ base: 2, md: 4 }} spacing="md">
      {tiles.map((tile) => (
        <Card key={tile.label} withBorder radius="md" p="md">
          <Text size="sm" c="dimmed">
            {tile.label}
          </Text>
          <Title order={2}>{tile.value}</Title>
          {tile.hint && (
            <Text size="xs" c="dimmed">
              {tile.hint}
            </Text>
          )}
        </Card>
      ))}
    </SimpleGrid>
  );
}
