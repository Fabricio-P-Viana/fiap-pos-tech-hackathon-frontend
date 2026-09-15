const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://hackathon-backend-sx6h.onrender.com/";

export async function apiRequest<T>(
  path: string,
  accessToken: string | undefined,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = "Não foi possível concluir a operação.";
    try {
      const body = (await response.json()) as {
        message?: string;
        error?: string;
      };
      message = body.message ?? body.error ?? message;
    } catch {
      // Preserve the generic message when the backend has no JSON response.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}
