"use client";

import {
  Button,
  Card,
  Group,
  Select,
  TextInput,
} from "@mantine/core";
import { IconFilterOff, IconSearch } from "@tabler/icons-react";
import type { CategoryRecord } from "@/types/resolve-ai";
import {
  emptyOccurrenceFilters,
  type OccurrenceFiltersValues,
} from "@/schemas/filters";
import { priorityOptions, sortOptions, statusOptions } from "@/lib/occurrence";

/**
 * Filtros da listagem. O estado é controlado pela página, que os repassa à
 * API — a filtragem acontece no backend, não no cliente.
 */
export function RequestFilters({
  values,
  categories,
  onChange,
  showSort = true,
}: {
  values: OccurrenceFiltersValues;
  categories: CategoryRecord[];
  onChange: (values: OccurrenceFiltersValues) => void;
  showSort?: boolean;
}) {
  const update = (patch: Partial<OccurrenceFiltersValues>) =>
    onChange({ ...values, ...patch });

  const isFiltered =
    Boolean(values.search) ||
    Boolean(values.status) ||
    Boolean(values.priority) ||
    Boolean(values.categoryId);

  return (
    <Card withBorder radius="md" p="md">
      <Group gap="sm" align="end" wrap="wrap">
        <TextInput
          label="Buscar"
          placeholder="Título ou descrição"
          leftSection={<IconSearch size={16} />}
          value={values.search ?? ""}
          onChange={(event) => update({ search: event.currentTarget.value })}
          style={{ flex: "1 1 220px" }}
        />
        <Select
          label="Status"
          placeholder="Todos"
          clearable
          data={statusOptions}
          value={values.status ?? null}
          onChange={(value) =>
            update({ status: value as OccurrenceFiltersValues["status"] })
          }
          style={{ flex: "0 1 160px" }}
        />
        <Select
          label="Prioridade"
          placeholder="Todas"
          clearable
          data={priorityOptions}
          value={values.priority ?? null}
          onChange={(value) =>
            update({ priority: value as OccurrenceFiltersValues["priority"] })
          }
          style={{ flex: "0 1 150px" }}
        />
        <Select
          label="Categoria"
          placeholder="Todas"
          clearable
          data={categories.map((category) => ({
            value: String(category.id),
            label: category.name,
          }))}
          value={values.categoryId ?? null}
          onChange={(value) => update({ categoryId: value })}
          style={{ flex: "0 1 170px" }}
        />
        {showSort && (
          <>
            <Select
              label="Ordenar por"
              data={sortOptions}
              value={values.sortBy ?? "createdAt"}
              onChange={(value) =>
                update({ sortBy: value as OccurrenceFiltersValues["sortBy"] })
              }
              style={{ flex: "0 1 170px" }}
            />
            <Select
              label="Ordem"
              data={[
                { value: "DESC", label: "Maior primeiro" },
                { value: "ASC", label: "Menor primeiro" },
              ]}
              value={values.sortOrder ?? "DESC"}
              onChange={(value) =>
                update({
                  sortOrder: value as OccurrenceFiltersValues["sortOrder"],
                })
              }
              style={{ flex: "0 1 160px" }}
            />
          </>
        )}
        {isFiltered && (
          <Button
            variant="subtle"
            color="dark"
            leftSection={<IconFilterOff size={16} />}
            onClick={() => onChange({ ...emptyOccurrenceFilters })}
          >
            Limpar
          </Button>
        )}
      </Group>
    </Card>
  );
}
