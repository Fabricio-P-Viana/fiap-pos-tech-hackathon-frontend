import { apiRequest } from "./api";
import type {
  CategoryRecord,
  OccurrenceRecord,
  OccurrenceStatus,
  UserRecord,
  UserRole,
  CommentRecord,
  OccurrenceEventRecord,
  RatingRecord,
  PaginatedResponse,
  OccurrenceFilterParams,
  DashboardIndicators,
} from "@/types/resolve-ai";

export function getUsers(token?: string) {
  return apiRequest<UserRecord[]>("/users", token);
}

export function createUser(
  token: string | undefined,
  data: { name: string; email: string; password: string },
  role: UserRole,
) {
  return apiRequest<UserRecord>(
    role === "MANAGER" ? "/users/managers" : "/users",
    token,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

export function updateUser(
  token: string | undefined,
  id: number,
  data: Partial<{ name: string; email: string; password: string }>,
) {
  return apiRequest<UserRecord>(`/users/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteUser(token: string | undefined, id: number) {
  return apiRequest<void>(`/users/${id}`, token, { method: "DELETE" });
}

export function getCategories(token?: string) {
  return apiRequest<CategoryRecord[]>("/categories", token);
}

export function createCategory(
  token: string | undefined,
  data: { name: string; description?: string },
) {
  return apiRequest<CategoryRecord>("/categories", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateCategory(
  token: string | undefined,
  id: number,
  data: { name?: string; description?: string; active?: boolean },
) {
  return apiRequest<CategoryRecord>(`/categories/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCategory(token: string | undefined, id: number) {
  return apiRequest<void>(`/categories/${id}`, token, { method: "DELETE" });
}

function buildQueryString(
  params?: Record<string, string | number | undefined>,
): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export async function getOccurrences(
  token?: string,
  filters?: OccurrenceFilterParams,
): Promise<OccurrenceRecord[]> {
  const result = await getOccurrencesPaginated(token, {
    limit: 100,
    ...filters,
  });
  return result.data;
}

export function getOccurrencesPaginated(
  token: string | undefined,
  filters?: OccurrenceFilterParams,
) {
  return apiRequest<PaginatedResponse<OccurrenceRecord>>(
    `/occurrences${buildQueryString(filters as Record<string, string | number | undefined>)}`,
    token,
  );
}

export function getDashboardIndicators(token?: string) {
  return apiRequest<DashboardIndicators>("/occurrences/dashboard", token);
}

export function cancelOccurrence(
  token: string | undefined,
  id: number,
  note?: string,
) {
  return apiRequest<OccurrenceRecord>(`/occurrences/${id}/cancel`, token, {
    method: "PATCH",
    body: JSON.stringify({ note }),
  });
}

export function getOccurrenceEvents(token: string | undefined, id: number) {
  return apiRequest<OccurrenceEventRecord[]>(
    `/occurrences/${id}/events`,
    token,
  );
}

export function getComments(token?: string) {
  return apiRequest<CommentRecord[]>("/comments", token);
}

export function createComment(
  token: string | undefined,
  data: { occurrenceId: number; body: string },
) {
  return apiRequest<CommentRecord>("/comments", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getRatings(token?: string) {
  return apiRequest<RatingRecord[]>("/ratings", token);
}

export function createRating(
  token: string | undefined,
  data: { occurrenceId: number; score: number; comment?: string },
) {
  return apiRequest<RatingRecord>("/ratings", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function uploadAttachment(
  token: string | undefined,
  occurrenceId: number,
  file: File,
) {
  const body = new FormData();
  body.append("occurrenceId", String(occurrenceId));
  body.append("file", file);
  return apiRequest<unknown>("/attachments/upload", token, {
    method: "POST",
    body,
    headers: {},
  });
}

export function createOccurrence(
  token: string | undefined,
  data: {
    categoryId: number;
    title: string;
    description: string;
    priority: string;
    locationText?: string;
    locationReference?: string;
    latitude?: number;
    longitude?: number;
  },
) {
  return apiRequest<OccurrenceRecord>("/occurrences", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function changeOccurrenceStatus(
  token: string | undefined,
  id: number,
  status: OccurrenceStatus,
  note?: string,
) {
  return apiRequest<OccurrenceRecord>(`/occurrences/${id}/status`, token, {
    method: "PATCH",
    body: JSON.stringify({ status, note }),
  });
}

export function assignOccurrence(
  token: string | undefined,
  id: number,
  assigneeId: number | null,
  note?: string,
) {
  return apiRequest<OccurrenceRecord>(`/occurrences/${id}/assignee`, token, {
    method: "PATCH",
    body: JSON.stringify({ assigneeId, note }),
  });
}

export function updateOccurrence(
  token: string | undefined,
  id: number,
  data: Partial<
    Pick<
      OccurrenceRecord,
      | "title"
      | "description"
      | "categoryId"
      | "priority"
      | "locationText"
      | "locationReference"
      | "resolution"
    >
  >,
) {
  return apiRequest<OccurrenceRecord>(`/occurrences/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteOccurrence(token: string | undefined, id: number) {
  return apiRequest<void>(`/occurrences/${id}`, token, { method: "DELETE" });
}
