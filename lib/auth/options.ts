import axios from "axios";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";
import { loginSchema } from "@/schemas/auth";

type AccessTokenPayload = {
  userId?: number | string;
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

type AuthApiUser = {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
};

type LoginApiResponse = {
  accessToken: string;
  user?: AuthApiUser | null;
};

const AUTH_API_TIMEOUT_MS = 5000;

const getHeader = (
  headers: Record<string, string | string[] | undefined> | undefined,
  key: string,
) => {
  const value = headers?.[key] ?? headers?.[key.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

const resolveBaseUrl = (
  headers: Record<string, string | string[] | undefined> | undefined,
) => {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  const host = getHeader(headers, "host") ?? "localhost:3000";
  const protocolHeader = getHeader(headers, "x-forwarded-proto");
  const protocol =
    protocolHeader?.split(",")[0]?.trim() ??
    (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
};

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, request) {
        const parsedCredentials = loginSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        try {
          const baseUrl = resolveBaseUrl(request?.headers);

          const response = await axios.post<LoginApiResponse>(
            `${baseUrl}/api/auth/login`,
            parsedCredentials.data,
            {
              timeout: AUTH_API_TIMEOUT_MS,
            },
          );

          const decoded = jwtDecode<AccessTokenPayload>(
            response.data.accessToken,
          );

          const resolvedId = String(
            response.data.user?.id ??
              decoded.userId ??
              decoded.sub ??
              parsedCredentials.data.email,
          );

          const resolvedEmail =
            response.data.user?.email ??
            decoded.email ??
            parsedCredentials.data.email;

          const resolvedName =
            response.data.user?.name ??
            decoded.name ??
            parsedCredentials.data.email;

          if (!resolvedEmail) {
            return null;
          }

          return {
            id: resolvedId,
            name: resolvedName,
            email: resolvedEmail,
            role: response.data.user?.role ?? decoded.role,
            accessToken: response.data.accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
        token.role = user.role;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.accessToken =
          typeof token.accessToken === "string" ? token.accessToken : undefined;
        session.user.role =
          typeof token.role === "string" ? token.role : undefined;
      }

      session.accessToken =
        typeof token.accessToken === "string" ? token.accessToken : undefined;

      return session;
    },
  },
};
