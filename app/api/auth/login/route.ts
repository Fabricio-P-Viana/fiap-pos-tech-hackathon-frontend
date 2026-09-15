import axios from "axios";
import { z } from "zod";
import { loginSchema } from "@/schemas/auth";

const AUTH_API_BASE_URL =
  process.env.AUTH_API_BASE_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://hackathon-backend-sx6h.onrender.com";

const AUTH_API_TIMEOUT_MS = 5000;

const backendLoginSchema = z.object({
  token: z.string().min(1),
  user: z
    .object({
      id: z.union([z.string(), z.number()]).optional(),
      name: z.string().optional(),
      email: z.string().optional(),
      role: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = loginSchema.parse(body);

    const backendResponse = await axios.post(
      `${AUTH_API_BASE_URL}/auth/login`,
      {
        email: data.email,
        password: data.password,
      },
      {
        timeout: AUTH_API_TIMEOUT_MS,
      },
    );

    const parsedBackend = backendLoginSchema.safeParse(backendResponse.data);

    if (!parsedBackend.success) {
      return Response.json(
        { message: "Resposta invalida da API de autenticacao." },
        { status: 502 },
      );
    }

    return Response.json({
      accessToken: parsedBackend.data.token,
      user: parsedBackend.data.user,
    });
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
          message: "Dados invalidos para login.",
          errors: error.flatten(),
        },
        { status: 400 },
      );
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 502;
      const message =
        (error.response?.data as { message?: string } | undefined)?.message ??
        "Falha ao autenticar no backend.";

      return Response.json({ message }, { status });
    }

    return Response.json(
      { message: "Erro inesperado ao autenticar." },
      { status: 500 },
    );
  }
}
