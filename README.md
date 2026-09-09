# Resolve Aí - Frontend

Frontend do Resolve Aí, plataforma de gestão de ocorrências, desenvolvido com Next.js, React e Mantine.

Neste momento o projeto mantém a base de autenticação e cadastro integrada ao backend. As telas de ocorrências serão desenvolvidas sobre essa base.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- NextAuth com JWT
- Mantine UI
- React Hook Form + Zod
- Axios

## Execução local

Pré-requisitos: Node.js 22 e o backend disponível.

```bash
npm install
cp env-example .env.local
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Variáveis de ambiente

| Variável | Descrição |
| --- | --- |
| `AUTH_API_BASE_URL` | URL base do backend usado pelos proxies de autenticação |
| `NEXT_PUBLIC_API_BASE_URL` | URL pública base da API, usada como fallback |
| `NEXTAUTH_URL` | URL da aplicação NextAuth |
| `NEXTAUTH_SECRET` | Segredo usado para assinar a sessão JWT |

## Integração de autenticação

- `POST /api/auth/login` encaminha credenciais para `/auth/login` no backend.
- `POST /api/auth/register` encaminha cadastro para `/users` no backend.
- NextAuth mantém a sessão com estratégia JWT.
- O token de acesso e a role do usuário ficam disponíveis na sessão.
- As roles usadas pelo backend são `REQUESTER` e `MANAGER`.

## Estrutura atual

```text
app/
  api/auth/
    [...nextauth]/route.ts
    login/route.ts
    register/route.ts
  login/page.tsx
  page.tsx
  layout.tsx
components/
  fixed-header/
  footer/
  login/
  register/
lib/auth/
  options.ts
schemas/
  auth.ts
proxy.ts
```

## Próximos módulos

A implementação das telas e integração de ocorrências será feita posteriormente, incluindo categorias, listagem, filtros, comentários, anexos, histórico, avaliações e dashboard de gestores.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```
