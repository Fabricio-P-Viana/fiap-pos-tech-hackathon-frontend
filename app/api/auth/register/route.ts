import axios from "axios";
import { z } from "zod";
import { registerSchema } from "@/schemas/auth";

const AUTH_API_BASE_URL =
  process.env.AUTH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:3001";

const AUTH_API_TIMEOUT_MS = 5000;

const backendUserSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
  email: z.string(),
  role: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = registerSchema.parse(body);

    const backendResponse = await axios.post(
      `${AUTH_API_BASE_URL}/users`,
      {
        name: data.name,
        email: data.email,
        password: data.password,
      },
      {
        timeout: AUTH_API_TIMEOUT_MS,
      },
    );

    const parsedBackendUser = backendUserSchema.safeParse(backendResponse.data);

    if (!parsedBackendUser.success) {
      return Response.json(
        { message: "Resposta invalida da API de cadastro." },
        { status: 502 },
      );
    }

    return Response.json(
      {
        message: "Conta criada com sucesso.",
        user: {
          id: parsedBackendUser.data.id,
          name: parsedBackendUser.data.name,
          email: parsedBackendUser.data.email,
          role: parsedBackendUser.data.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof SyntaxError) {
      return Response.json(
        { message: "Payload JSON invalido." },
        { status: 400 },
      );
    }

    if (error instanceof z.ZodError) {
      return Response.json(
        {
          message: "Dados invalidos para cadastro.",
          errors: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Falha ao cadastrar no backend.";

      return Response.json({ message }, { status });
    }

    return Response.json(
      { message: "Erro inesperado ao cadastrar." },
      { status: 500 },
    );
  }
}
