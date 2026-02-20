<p align="center">
  <img src="https://nextjs.org/icons/next.svg" width="80" alt="Next.js Logo" />
</p>

<h1 align="center">TaskFlow — Frontend</h1>
<p align="center">Interface web do TaskFlow: Kanban com drag-and-drop, tempo real e autenticação OAuth</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000000?style=flat-square&logo=nextdotjs" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" />
  <img src="https://img.shields.io/badge/Zustand-5-FF9900?style=flat-square" />
  <img src="https://img.shields.io/badge/Socket.io-4-010101?style=flat-square&logo=socketdotio" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-38BDF8?style=flat-square&logo=tailwindcss" />
</p>

---

## 🛠️ Tech Stack

| Tecnologia | Uso |
|-----------|-----|
| **Next.js 14** | App Router, SSR, middleware de autenticação |
| **TypeScript** | Tipagem estática end-to-end |
| **Zustand** | Estado global — boards, cards, auth |
| **React Hook Form + Zod** | Formulários com validação tipada |
| **DND Kit** | Drag-and-drop de cards entre colunas |
| **Radix UI + shadcn/ui** | Componentes acessíveis (Modal, Popover, etc.) |
| **TailwindCSS** | Estilos utilitários |
| **Socket.io-client** | Atualizações em tempo real |
| **Axios** | Comunicação com a API REST |
| **date-fns** | Formatação de datas (ptBR) |

---

## 🚀 Setup Local

### Pré-requisitos
- Node.js v20+
- Backend do TaskFlow rodando em `http://localhost:3001`

### Instalação

```bash
npm install
```

### Variáveis de Ambiente

Crie `.env.local` na raiz:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

### Rodando

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start
```

Acesse: `http://localhost:3000`

---

## 📁 Estrutura

```
src/
├── app/              # Rotas e layouts (App Router)
├── components/
│   ├── cards/        # Modal de card, activity log, comentários
│   ├── boards/       # Quadro Kanban com colunas e drag-and-drop
│   └── ui/           # Componentes primitivos (Button, Dialog…)
├── hooks/            # useCards, useAuth, useSockets
├── services/         # Camada de API (axios)
├── stores/           # Zustand stores (auth, cards)
└── types/            # Tipos TypeScript compartilhados
```

---

## ✨ Funcionalidades

- **Kanban** com drag-and-drop entre colunas e entre boards
- **Tempo real** — movimentação de cards, membros e comentários sincronizados via WebSocket
- **Autenticação** — email/senha, Google OAuth e GitHub OAuth
- **Detalhes do card** — comentários, anexos (S3), etiquetas, membros, data de entrega
- **Histórico de atividades** paginado por card
- **Calendário** — visualização de cards com prazo
- **Dashboard** — métricas do ambiente (cards, membros, atividade)
- **Dark / Light mode**
- **Segurança** — token armazenado em cookie (nunca no `localStorage`)

---

## 🚢 Deploy (Vercel)

1. Conecte o repositório na Vercel
2. Configure as variáveis de ambiente:
   - `NEXT_PUBLIC_API_URL`: URL do backend em produção (ex: `https://taskflow-api.onrender.com/api`)
   - `NEXT_PUBLIC_SOCKET_URL`: URL raiz do backend (ex: `https://taskflow-api.onrender.com`)
3. Framework auto-detectado como **Next.js** — deploy automático a cada push

---

## 📄 Licença

MIT
