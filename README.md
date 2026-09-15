# Resolve Aí - Frontend

Frontend do Resolve Aí, plataforma de gestão de ocorrências, desenvolvido com Next.js, React e Mantine

O projeto cobre o fluxo completo integrado ao backend: o solicitante abre solicitações com foto, acompanha o andamento por uma linha do tempo e avalia a resolução; o gestor define o responsável, conduz cada atendimento, acompanha a própria fila por prioridade e consulta os indicadores e as notas no dashboard.

> **Sobre a base do projeto:** escolhi esta base (Next.js com App Router, NextAuth, Mantine e React Hook Form + Zod) porque já a utilizei em entregas anteriores da pós. Com autenticação, sessão, tema e padrão de formulários já resolvidos, pude dedicar o tempo do hackathon às telas e às regras das ocorrências — isso acelerou muito o desenvolvimento.

## Stack

- Next.js 16 com App Router
- React 19
- TypeScript
- NextAuth com JWT
- Mantine UI 9 e Tabler Icons
- React Hook Form + Zod (validação de todos os formulários)
- Axios nos proxies de autenticação e cadastro; Fetch API nas chamadas das telas (`services/api.ts`)

## Execução local

Pré-requisitos: Node.js 22 e o backend disponível (por padrão em `http://localhost:3001`).

```bash
npm install
cp env-example .env.local
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`.

## Variáveis de ambiente

| Variável                   | Descrição                                                                      |
| -------------------------- | ------------------------------------------------------------------------------ |
| `AUTH_API_BASE_URL`        | URL base do backend usado pelos proxies de autenticação                        |
| `NEXT_PUBLIC_API_BASE_URL` | URL pública base da API consumida pelas telas (padrão `http://localhost:3001`) |
| `NEXTAUTH_URL`             | URL da aplicação NextAuth                                                      |
| `NEXTAUTH_SECRET`          | Segredo usado para assinar a sessão JWT                                        |
| `NODE_ENV`                 | Ambiente de execução (`development` ou `production`)                           |

## Integração de autenticação

- `POST /api/auth/login` encaminha credenciais para `/auth/login` no backend.
- `POST /api/auth/register` encaminha cadastro para `/users` no backend.
- NextAuth mantém a sessão com estratégia JWT.
- O token de acesso e a role do usuário ficam disponíveis na sessão, lidos pelas telas através do hook `useCurrentUser`.
- As roles usadas pelo backend são `REQUESTER` e `MANAGER`.
- O `proxy.ts` redireciona para o login quem acessa uma rota protegida sem sessão, preservando a página de destino.
- O componente `Protected` separa as áreas por perfil:
  - **Solicitante:** home com resumo, `/solicitacoes`, `/solicitacoes/nova` (exclusiva do solicitante) e o detalhe de cada solicitação.
  - **Gestor:** home com resumo da operação e a área `/gestao`, com uma página para cada seção — solicitações, meus atendimentos, dashboard, usuários e categorias.
- As ações exibidas no detalhe espelham as regras do backend: sem responsável definido nada é movimentado, somente o gestor responsável conduz o atendimento, somente o solicitante anexa fotos e, após resolvida, a solicitação aceita apenas a avaliação.

## Estrutura atual

```text
app/
  api/auth/                       Proxies de login/cadastro e NextAuth
  page.tsx                        Home: apresentação (deslogado) ou resumo por perfil
  login/page.tsx
  solicitacoes/
    page.tsx                      Lista do solicitante com filtros
    nova/page.tsx                 Abertura de solicitação com foto
    [id]/page.tsx                 Detalhe da solicitação
  gestao/
    layout.tsx                    Guarda de gestor + navegação da área
    solicitacoes/page.tsx         Todas as solicitações
    meus-atendimentos/page.tsx    Fila do responsável por prioridade ou tempo de abertura
    dashboard/page.tsx            Indicadores e notas das avaliações
    usuarios/page.tsx
    categorias/page.tsx
components/
  fixed-header/  footer/  login/  register/
  home/                           Hero, resumos do solicitante e do gestor, atividade recente
  requests/
    request-list.tsx  request-filters.tsx  new-request-form.tsx
    detail/                       Resumo, condução do gestor, edição, linha do tempo,
                                  imagens, comentários, avaliação e cancelamento com motivo
  management/
    management-nav.tsx
    requests/                     Lista geral e meus atendimentos
    dashboard/                    Painel e barras de distribuição
    users/  categories/           Tabelas e modais com formulários validados
  shared/                         Tabela e card de solicitação, badges, timeline,
                                  cabeçalho de página, estados de feedback e guarda de rota
lib/
  auth/options.ts
  occurrence.ts                   Rótulos, cores, datas e tradução dos eventos da timeline
  use-current-user.ts             Sessão, token e perfil
  use-occurrence-list.ts          Filtros, ordenação e paginação resolvidos pela API
schemas/                          Zod: auth, occurrence, user, category, interaction, filters
services/
  api.ts                          Cliente HTTP com token
  resolve-ai.ts                   Chamadas da API por recurso
types/
  resolve-ai.ts                   Contratos da API
proxy.ts
```

## Próximos módulos

O fluxo previsto nos requisitos está implementado. Como evolução, ficam mapeados:

- **Notificações de andamento:** avisar o solicitante sempre que a solicitação mudar de status.
- **Abertura por voz ou vídeo:** permitir registrar a solicitação por áudio ou vídeo, com processamento por IA para extrair a descrição, a categoria e a localização.
- **Atribuição automática do responsável:** definir o gestor responsável com base na categoria e na região da solicitação.
- **Agrupamento de solicitações semelhantes:** identificar registros do mesmo caso e reuni-los, evitando duplicidade e dois responsáveis atuando no mesmo problema.
- **Aplicativo mobile:** versão para celular voltada ao solicitante.

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

---

## Participante

| RM       | Nome                   | GitHub                                      |
| -------- | ---------------------- | ------------------------------------------- |
| RM369372 | Fabricio Pereira Viana | [GitHub](https://github.com/fabriciopviana) |
