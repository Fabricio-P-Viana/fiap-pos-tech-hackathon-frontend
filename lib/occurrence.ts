import type {
  OccurrenceEventRecord,
  OccurrencePriority,
  OccurrenceRecord,
  OccurrenceStatus,
} from "@/types/resolve-ai";
import { priorityLabels, statusLabels } from "@/types/resolve-ai";

export const statusColors: Record<OccurrenceStatus, string> = {
  OPEN: "blue",
  IN_ANALYSIS: "indigo",
  IN_PROGRESS: "orange",
  RESOLVED: "teal",
  CANCELLED: "red",
};

export const priorityColors: Record<OccurrencePriority, string> = {
  LOW: "gray",
  MEDIUM: "blue",
  HIGH: "orange",
  CRITICAL: "red",
};

/** Rótulo da ação que leva a cada status, usado nos botões do gestor. */
export const statusActionLabels: Record<OccurrenceStatus, string> = {
  OPEN: "Reabrir",
  IN_ANALYSIS: "Colocar em análise",
  IN_PROGRESS: "Iniciar atendimento",
  RESOLVED: "Marcar como resolvida",
  CANCELLED: "Cancelar",
};

export const statusOptions = (
  Object.keys(statusLabels) as OccurrenceStatus[]
).map((value) => ({ value, label: statusLabels[value] }));

export const priorityOptions = (
  Object.keys(priorityLabels) as OccurrencePriority[]
).map((value) => ({ value, label: priorityLabels[value] }));

export const sortOptions = [
  { value: "priority", label: "Prioridade" },
  { value: "createdAt", label: "Tempo de abertura" },
  { value: "updatedAt", label: "Última atualização" },
  { value: "status", label: "Status" },
];

export function formatDateTime(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(value?: string | null): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("pt-BR");
}

/** "há 3 dias", "há 2 h" — leitura rápida do tempo de espera na fila. */
export function formatRelative(value?: string | null): string {
  if (!value) return "-";
  const elapsedMs = Date.now() - new Date(value).getTime();
  if (elapsedMs < 0) return "agora";

  const minutes = Math.floor(elapsedMs / 60000);
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `há ${hours} h`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} ${days === 1 ? "dia" : "dias"}`;

  const months = Math.floor(days / 30);
  if (months < 12) return `há ${months} ${months === 1 ? "mês" : "meses"}`;

  const years = Math.floor(months / 12);
  return `há ${years} ${years === 1 ? "ano" : "anos"}`;
}

/** Tempo decorrido desde a abertura, em horas, para ordenar/exibir a fila. */
export function hoursSince(value?: string | null): number | null {
  if (!value) return null;
  return Math.floor((Date.now() - new Date(value).getTime()) / 3600000);
}

export function statusLabel(value?: string | null): string {
  if (!value) return "-";
  return statusLabels[value as OccurrenceStatus] ?? value;
}

export function priorityLabel(value?: string | null): string {
  if (!value) return "-";
  return priorityLabels[value as OccurrencePriority] ?? value;
}

export function requesterLabel(occurrence: OccurrenceRecord): string {
  return occurrence.requesterName ?? `Usuário #${occurrence.requesterId}`;
}

export function assigneeLabel(occurrence: OccurrenceRecord): string {
  if (occurrence.assigneeName) return occurrence.assigneeName;
  if (occurrence.assigneeId) return `Usuário #${occurrence.assigneeId}`;
  return "Sem responsável";
}

export function authorLabel(
  authorName: string | null | undefined,
  authorId: number,
): string {
  return authorName ?? `Usuário #${authorId}`;
}

export type TimelineEntry = {
  id: number;
  title: string;
  detail: string | null;
  actor: string;
  createdAt?: string;
  status?: OccurrenceStatus;
};

/**
 * Converte o evento cru ("IN_ANALYSIS → IN_PROGRESS") em uma frase única e
 * traduzida. O backend já entrega os nomes e os rótulos legíveis; aqui só
 * resta escolher a redação de cada tipo de evento.
 */
export function describeEvent(event: OccurrenceEventRecord): TimelineEntry {
  const actor = authorLabel(event.actorName, event.actorId);
  const base = {
    id: event.id,
    actor,
    createdAt: event.createdAt,
    detail: event.note?.trim() ? event.note.trim() : null,
  };

  switch (event.type) {
    case "CREATED":
      return { ...base, title: "Solicitação aberta" };

    case "STATUS_CHANGED": {
      const next = event.newValue as OccurrenceStatus | undefined;
      if (next === "RESOLVED")
        return { ...base, title: "Solicitação resolvida", status: next };
      if (next === "CANCELLED")
        return { ...base, title: "Solicitação cancelada", status: next };
      return {
        ...base,
        title: `Status alterado para ${statusLabel(event.newValue)}`,
        status: next,
      };
    }

    case "PRIORITY_CHANGED":
      return {
        ...base,
        title: `Prioridade alterada para ${priorityLabel(event.newValue)}`,
      };

    case "ASSIGNEE_CHANGED": {
      const assignee = event.newLabel ?? event.newValue;
      return {
        ...base,
        title: assignee
          ? `Responsável definido: ${assignee}`
          : "Responsável removido",
      };
    }

    default:
      return { ...base, title: "Solicitação atualizada" };
  }
}
