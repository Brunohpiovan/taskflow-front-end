# TaskFlow - Frontend

Frontend do TaskFlow, aplicação inspirada no Trello para organização de atividades pessoais.

## Stack

- **Next.js 14** (App Router)
- **React 18** + TypeScript
- **Tailwind CSS** + shadcn/ui (Radix UI)
- **Zustand** (estado global)
- **Axios** (HTTP)
- **React Hook Form** + **Zod** (formulários e validação)
- **@dnd-kit** (drag and drop)

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Variáveis de ambiente (crie .env.local)
cp .env.example .env.local
# Edite .env.local e defina NEXT_PUBLIC_API_URL (ex: http://localhost:3001/api)

# Rodar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Build e lint

```bash
npm run build
npm run lint
```

## Deploy (Vercel)

1. Conecte o repositório à [Vercel](https://vercel.com).
2. Configure a variável de ambiente:
   - `NEXT_PUBLIC_API_URL`: URL da API (ex: `https://sua-api.vercel.app/api`).
3. Deploy automático a cada push na branch principal.

### Deploy via CLI

```bash
npm i -g vercel
vercel login
vercel          # preview
vercel --prod   # produção
```

## Estrutura

- `src/app` – rotas (App Router)
- `src/components` – componentes (ui, layout, shared, providers, environments, boards, cards)
- `src/hooks` – hooks customizados
- `src/services` – chamadas à API (Axios)
- `src/stores` – stores Zustand
- `src/types` – tipos TypeScript
- `src/lib` – utilitários, constantes, validações (Zod)

## Rotas

- `/login` – Login
- `/register` – Cadastro
- `/dashboard` – Dashboard (resumo)
- `/environments` – Lista de ambientes
- `/environments/[id]` – Quadros e cards do ambiente (Kanban com drag and drop)

## Backend

O frontend espera uma API REST (ex.: NestJS) com os endpoints descritos no plano do projeto (auth, environments, boards, cards).
