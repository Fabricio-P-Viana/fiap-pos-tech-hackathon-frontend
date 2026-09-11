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
  assigneeId?: number | null;
  categoryId: number;
  title: string;
  description: string;
  status: OccurrenceStatus;
  priority: OccurrencePriority;
  locationText?: string | null;
  locationReference?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  resolution?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type OccurrenceEventRecord = {
  id: number;
  occurrenceId: number;
  type: "CREATED" | "STATUS_CHANGED" | "PRIORITY_CHANGED" | "ASSIGNEE_CHANGED";
  previousValue?: string | null;
  newValue?: string | null;
  note?: string | null;
  actorId: number;
  createdAt?: string;
};

export type CommentRecord = {
  id: number;
  occurrenceId: number;
  authorId: number;
  body: string;
  isInternal: boolean;
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

export type OccurrenceFilterParams = {
  status?: OccurrenceStatus;
  priority?: OccurrencePriority;
  categoryId?: number;
  assigneeId?: number;
  search?: string;
  createdFrom?: string;
  createdTo?: string;
  resolvedFrom?: string;
  resolvedTo?: string;
  page?: number;
  limit?: number;
};

export type DashboardIndicators = {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Array<{ categoryId: number; categoryName: string; total: number }>;
  open: number;
  inProgress: number;
  resolved: number;
  averageResolutionHours: number | null;
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
