# TaskFlow - Frontend

Frontend do **TaskFlow**, uma aplicação moderna de gestão de tarefas estilo Kanban, construída com Next.js 14 e shadcn/ui.

## ✨ Funcionalidades

- **Kanban Board Interativo**: Arraste e solte cards entre colunas (Drag & Drop com `@dnd-kit`).
- **Gestão de Ambientes**: Múltiplos ambientes de trabalho com permissões (Dono/Membro).
- **Detalhes do Card**:
  - Comentários e Anexos (integração S3).
  - Etiquetas coloridas personalizáveis.
  - Membros e responsáveis.
  - Datas de entrega e Checklist.
- **Atualizações em Tempo Real**: Alterações refletidas instantaneamente para todos os usuários via **Socket.io**.
- **Dashboard**: Métricas de produtividade e visão geral.
- **Autenticação Segura**: Login social (Google/GitHub) e recuperação de senha.
- **Temas**: Suporte a Dark/Light mode.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Linguagem:** TypeScript
- **Estilização:** Tailwind CSS + [shadcn/ui](https://ui.shadcn.com/)
- **Estado Global:** [Zustand](https://github.com/pmndrs/zustand)
- **Formulários:** React Hook Form + Zod
- **Drag & Drop:** @dnd-kit
- **Comunicação:** Axios + Socket.io-client

## 🚀 Como rodar o projeto

### Pré-requisitos

- Node.js (v18+)
- Backend do TaskFlow rodando (padrão: `http://localhost:3001`)

### Instalação

```bash
# Instalar dependências
npm install
```

### Configuração

Crie um arquivo `.env.local` na raiz do projeto:

```env
# API URL (Backend)
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# WebSocket URL (Geralmente a mesma raiz da API sem /api)
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Rodando

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

Acesse [http://localhost:3000](http://localhost:3000).

## 📁 Estrutura do Projeto

- `src/app` – Rotas e layouts (Next.js App Router).
- `src/components` – Componentes UI reutilizáveis e específicos.
  - `cards/` – Componentes relacionados a cards (Modal, Detalhes).
  - `boards/` – Componentes do quadro Kanban.
- `src/hooks` – Hooks personalizados (useSockets, useAuth).
- `src/services` – Camada de serviço para comunicação com API.
- `src/stores` – Gerenciamento de estado global (Zustand).

## 🚢 Deploy

O projeto é otimizado para deploy na **Vercel** ou **Render**.

### Variáveis de Ambiente em Produção

Certifique-se de configurar:
- `NEXT_PUBLIC_API_URL`: URL do seu backend em produção.

---

