"use client";

import { Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconCalendar } from "@tabler/icons-react";
import { useState } from "react";
import {
  DASHBOARD_PERIOD_DAYS,
  lastDashboardPeriod,
  shiftDateInput,
  toDateInputValue,
  validateDashboardPeriod,
  type DashboardPeriodInput,
} from "@/lib/dashboard-period";

export function DashboardPeriodFilter({
  value,
  loading,
  onApply,
}: {
  value: DashboardPeriodInput;
  loading?: boolean;
  onApply: (period: DashboardPeriodInput) => void;
}) {
  const [draft, setDraft] = useState<DashboardPeriodInput>(value);
  const [today] = useState(() => toDateInputValue(new Date()));

  const error = validateDashboardPeriod(draft);
  const unchanged = draft.from === value.from && draft.to === value.to;

  const earliestFrom = draft.to
    ? shiftDateInput(draft.to, -(DASHBOARD_PERIOD_DAYS - 1))
    : undefined;
  const latestFrom = draft.to && draft.to < today ? draft.to : today;
  const latestToByRange = draft.from
    ? shiftDateInput(draft.from, DASHBOARD_PERIOD_DAYS - 1)
    : today;
  const latestTo = latestToByRange < today ? latestToByRange : today;

  function resetToLastPeriod() {
    const period = lastDashboardPeriod();
    setDraft(period);
    onApply(period);
  }

  return (
    <Stack gap={4}>
      <Group gap="sm" align="end" wrap="wrap">
        <TextInput
          type="date"
          label="De"
          value={draft.from}
          min={earliestFrom}
          max={latestFrom}
          leftSection={<IconCalendar size={16} />}
          onChange={(event) => {
            const from = event.currentTarget.value;
            setDraft((current) => ({ ...current, from }));
          }}
        />
        <TextInput
          type="date"
          label="Até"
          value={draft.to}
          min={draft.from || undefined}
          max={latestTo}
          leftSection={<IconCalendar size={16} />}
          onChange={(event) => {
            const to = event.currentTarget.value;
            setDraft((current) => ({ ...current, to }));
          }}
        />
        <Button
          onClick={() => onApply(draft)}
          disabled={Boolean(error) || unchanged}
          loading={loading}
        >
          Aplicar
        </Button>
        <Button variant="subtle" color="dark" onClick={resetToLastPeriod}>
          Últimos {DASHBOARD_PERIOD_DAYS} dias
        </Button>
      </Group>
      <Text size="xs" c={error ? "red" : "dimmed"}>
        {error ?? `Consulte períodos de até ${DASHBOARD_PERIOD_DAYS} dias.`}
      </Text>
    </Stack>
  );
}
