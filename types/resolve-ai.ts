export type UserRole = "REQUESTER" | "MANAGER";

export type UserRecord = {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
};

export type CategoryRecord = {
  id: number;
  name: string;
  description?: string | null;
  active: boolean;
};

export type OccurrenceStatus =
  | "OPEN"
  | "IN_ANALYSIS"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CANCELLED";

export type OccurrencePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type OccurrenceRecord = {
  id: number;
  requesterId: number;
  requesterName?: string | null;
  assigneeId?: number | null;
  assigneeName?: string | null;
  categoryId: number;
  categoryName?: string | null;
  title: string;
  description: string;
  status: OccurrenceStatus;
  priority: OccurrencePriority;
  locationText?: string | null;
  locationReference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resolution?: string | null;
  cancellationReason?: string | null;
  resolvedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export const STATUS_TRANSITIONS: Record<OccurrenceStatus, OccurrenceStatus[]> =
  {
    OPEN: ["IN_ANALYSIS", "CANCELLED"],
    IN_ANALYSIS: ["IN_PROGRESS", "CANCELLED"],
    IN_PROGRESS: ["RESOLVED", "CANCELLED"],
    RESOLVED: [],
    CANCELLED: [],
  };

export function isFinalStatus(status: OccurrenceStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

export function getNextStatuses(status: OccurrenceStatus): OccurrenceStatus[] {
  return STATUS_TRANSITIONS[status];
}

export type OccurrenceEventType =
  | "CREATED"
  | "STATUS_CHANGED"
  | "PRIORITY_CHANGED"
  | "ASSIGNEE_CHANGED";

export type OccurrenceEventRecord = {
  id: number;
  occurrenceId: number;
  occurrenceTitle?: string | null;
  type: OccurrenceEventType;
  previousValue?: string | null;
  newValue?: string | null;
  /** previousValue/newValue já legíveis (ids de usuário resolvidos em nome). */
  previousLabel?: string | null;
  newLabel?: string | null;
  note?: string | null;
  actorId: number;
  actorName?: string | null;
  createdAt?: string;
};

export type CommentRecord = {
  id: number;
  occurrenceId: number;
  authorId: number;
  authorName?: string | null;
  body: string;
  isInternal: boolean;
  createdAt?: string;
};

export type AttachmentRecord = {
  id: number;
  occurrenceId: number;
  filePath: string;
  url?: string | null;
  mimeType: string;
  sizeBytes: number;
  createdAt?: string;
};

export type RatingRecord = {
  id: number;
  occurrenceId: number;
  authorId: number;
  score: number;
  comment?: string | null;
  createdAt?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type OccurrenceSortField =
  | "createdAt"
  | "updatedAt"
  | "priority"
  | "status";

export type OccurrenceFilterParams = {
  status?: OccurrenceStatus;
  priority?: OccurrencePriority;
  categoryId?: number;
  /** Id do responsável ou "me" para o usuário autenticado. */
  assigneeId?: number | "me";
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  resolvedFrom?: string;
  resolvedTo?: string;
  sortBy?: OccurrenceSortField;
  sortOrder?: "ASC" | "DESC";
  page?: number;
  limit?: number;
};

export type RatingIndicators = {
  count: number;
  average: number | null;
  distribution: Record<string, number>;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    count: number;
    average: number;
  }>;
};

export type DashboardIndicators = {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Array<{
    categoryId: number;
    categoryName: string;
    total: number;
  }>;
  open: number;
  inProgress: number;
  resolved: number;
  averageResolutionHours: number | null;
  ratings?: RatingIndicators;
};

export const statusLabels: Record<OccurrenceStatus, string> = {
  OPEN: "Aberta",
  IN_ANALYSIS: "Em análise",
  IN_PROGRESS: "Em atendimento",
  RESOLVED: "Resolvida",
  CANCELLED: "Cancelada",
};

export const priorityLabels: Record<OccurrencePriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};
