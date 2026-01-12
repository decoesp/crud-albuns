# Meus Albuns de Fotos

Sistema completo de gerenciamento de albuns de fotos com autenticacao JWT, OAuth, upload S3-compatible, extracao de metadados EXIF e compartilhamento publico.

## Stack Tecnologica

### Backend
- **Runtime**: Node.js 20 + TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Banco de Dados**: MySQL 8
- **Autenticacao**: JWT + Refresh Token, OAuth (Google/GitHub) via Passport.js
- **Validacao**: Zod
- **Storage**: S3-compatible (MinIO/AWS S3)
- **Processamento de Imagens**: Sharp + exif-parser
- **Testes**: Vitest + Supertest

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Estilizacao**: Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Formularios**: React Hook Form + Zod
- **Roteamento**: React Router DOM
- **Icones**: Lucide React
- **Upload**: react-dropzone
- **Testes**: Vitest + Cypress

### Infraestrutura
- **Containerizacao**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Proxy Reverso**: Nginx

## Arquitetura

### Camadas do Backend
Controllers - Services - Repositories - Prisma - MySQL

## Funcionalidades

### Autenticacao
- Registro com validacao de senha forte
- Login com JWT + Refresh Token
- OAuth com Google e GitHub
- Recuperacao de senha por email
- Logout com invalidacao de refresh token

### Albuns
- CRUD completo de albuns
- Listagem paginada com ordenacao
- Soft delete (exclusao logica)
- Compartilhamento publico via link unico
- Protecao contra exclusao de album com fotos

### Fotos
- Upload via signed URL (direto para S3)
- Upload em lote com drag-and-drop
- Extracao automatica de metadados EXIF
- Deteccao de cor predominante
- Visualizacao em grid e tabela
- Ordenacao por data, tamanho, data de aquisicao

## Instalacao

### Pre-requisitos
- Node.js 20+
- Docker e Docker Compose
- MySQL 8 (ou use Docker)

### Desenvolvimento Local

1. Clone o repositorio:
```bash
git clone https://github.com/seu-usuario/crud-albuns.git
cd crud-albuns
```

2. Configure as variaveis de ambiente:
```bash
cp .env.example .env
# Edite o arquivo .env com suas configuracoes
```

3. Inicie os servicos com Docker:
```bash
docker-compose up -d mysql minio
```

4. Instale as dependencias do backend:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

**Nota sobre Prisma 7**: Este projeto usa Prisma 7.x, que mudou a configuracao de datasource. A URL do banco agora e passada no construtor do PrismaClient em vez do schema.prisma.

5. Instale as dependencias do frontend:
```bash
cd frontend
npm install
npm run dev
```

6. Acesse:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- MinIO Console: http://localhost:9001

### Producao com Docker

```bash
docker-compose up -d
```

## Estrutura do Projeto

```
crud-albuns/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tests/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile
│   └── package.json
├── .github/
│   └── workflows/
│       └── ci.yml
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Autenticacao
- POST /api/auth/register - Registro de usuario
- POST /api/auth/login - Login
- POST /api/auth/refresh - Refresh token
- POST /api/auth/logout - Logout
- POST /api/auth/forgot-password - Solicitar recuperacao
- POST /api/auth/reset-password - Redefinir senha
- GET /api/auth/profile - Perfil do usuario
- GET /api/auth/google - OAuth Google
- GET /api/auth/github - OAuth GitHub

### Albuns
- GET /api/albums - Listar albuns
- POST /api/albums - Criar album
- GET /api/albums/:id - Detalhes do album
- PATCH /api/albums/:id - Atualizar album
- DELETE /api/albums/:id - Excluir album
- POST /api/albums/:id/share - Compartilhar album

### Fotos
- GET /api/albums/:albumId/photos - Listar fotos
- POST /api/albums/:albumId/photos - Criar foto
- POST /api/albums/:albumId/photos/upload-url - Gerar URL de upload
- POST /api/albums/:albumId/photos/batch-upload-url - URLs em lote
- GET /api/albums/:albumId/photos/:id - Detalhes da foto
- PATCH /api/albums/:albumId/photos/:id - Atualizar foto
- DELETE /api/albums/:albumId/photos/:id - Excluir foto

### Publico
- GET /api/public/albums/:shareToken - Album compartilhado

## Testes

### Backend
```bash
cd backend
npm run test          # Testes unitarios
npm run test:integration  # Testes de integracao
```

### Frontend
```bash
cd frontend
npm run test          # Testes unitarios
npm run cypress:open  # Testes E2E
```

## Seguranca

- Senhas hasheadas com bcrypt (salt rounds: 12)
- JWT com expiracao curta (15min) + refresh token (7 dias)
- Validacao de entrada com Zod em todas as rotas
- Sanitizacao de dados
- CORS configurado
- Helmet para headers de seguranca
- Rate limiting (recomendado adicionar em producao)
- Soft delete para preservar dados

## Performance

### Compressao de Imagens (Client-Side)

O sistema implementa compressao automatica de imagens antes do upload:

**Implementacao** (`frontend/src/lib/imageCompression.ts`):
- Conversao automatica para WebP (com fallback para JPEG)
- Redimensionamento de imagens > 2048px
- Qualidade padrao: 80%
- Reducao tipica: 60-70% do tamanho original

**Trade-offs documentados**:

| Aspecto | Decisao | Justificativa |
|---------|---------|---------------|
| Qualidade | 80% | Equilibrio entre tamanho e qualidade visual |
| Formato | WebP (fallback JPEG) | Melhor compressao com suporte amplo |
| Dimensao maxima | 2048px | Suficiente para visualizacao web |
| Processamento | Main thread | Simplicidade; para escala, usar Web Workers |

**Beneficios**:
- Reducao de tempo de upload
- Economia de banda do usuario
- Menor custo de armazenamento S3
- Feedback visual do progresso de compressao

### Estrategia de Otimizacao de Imagens

1. **Upload**: Compressao client-side antes do envio
2. **Armazenamento**: Formato WebP otimizado
3. **Exibicao**: URLs assinadas com cache headers
4. **Lazy Loading**: Imagens carregadas sob demanda (nativo do browser)

## Acessibilidade (A11y)

O projeto segue as diretrizes WCAG 2.1 nivel AA:

### Implementado

**Labels Acessiveis**:
- Todos os inputs possuem labels associados via `htmlFor`/`id`
- Campos obrigatorios indicados visualmente e via `aria-required`
- Mensagens de erro associadas via `aria-describedby`
- Icones decorativos marcados com `aria-hidden="true"`

**Navegacao por Teclado**:
- Todos os elementos interativos sao focaveis
- Ordem de tabulacao logica (tab index natural)
- Botoes e links acessiveis via Enter/Space
- Modais com trap de foco

**Foco Visivel**:
- Estados de foco visiveis em todos os elementos interativos
- Uso de `focus-visible` para evitar foco em cliques de mouse
- Ring de foco com contraste adequado (primary-500)
- Offset de 2px para melhor visibilidade

**Componentes Acessiveis**:
- `Button`: aria-busy, aria-disabled, aria-label
- `Input`: aria-invalid, aria-describedby, role="alert" para erros
- `Modal`: role="dialog", aria-modal, aria-labelledby
- Upload area: role="button", aria-label descritivo

**Feedback ao Usuario**:
- Mensagens de status com `role="status"` e `aria-live="polite"`
- Erros de formulario com `role="alert"`
- Loading states comunicados via aria-busy

### Decisoes Conscientes

| Item | Status | Justificativa |
|------|--------|---------------|
| Skip links | Nao implementado | Aplicacao SPA com navegacao simples |
| Alto contraste | Parcial | Cores seguem padrao Tailwind com bom contraste |
| Reducao de movimento | Nao implementado | Animacoes sao sutis e nao essenciais |
| Screen reader testing | Recomendado | Testar com NVDA/VoiceOver antes de producao |

## Checklist de Avaliacao

### Backend
- [x] Node.js + TypeScript
- [x] Express.js
- [x] Prisma ORM + MySQL
- [x] JWT + Refresh Token
- [x] OAuth (Google/GitHub)
- [x] Validacao com Zod
- [x] Upload S3-compatible com signed URLs
- [x] Extracao de metadados (EXIF, cor dominante)
- [x] Arquitetura em camadas (Controllers/Services/Repositories)
- [x] Soft delete
- [x] Global error handler
- [x] Testes unitarios e integracao

### Frontend
- [x] React + TypeScript
- [x] Tailwind CSS
- [x] React Query
- [x] React Hook Form + Zod
- [x] Visualizacao em grid e tabela
- [x] Upload drag-and-drop
- [x] Paginacao
- [x] Compartilhamento publico

### Performance
- [x] Compressao de imagens client-side (WebP/JPEG)
- [x] Trade-offs documentados no README
- [x] Estrategia de otimizacao (formato, tamanho, qualidade)
- [x] Feedback visual de compressao

### Acessibilidade (A11y)
- [x] Labels acessiveis em todos os inputs
- [x] Navegacao por teclado funcional
- [x] Foco visivel (focus-visible)
- [x] Componentes com aria-* apropriados
- [x] Mensagens de erro com role="alert"
- [x] Loading states com aria-busy
- [x] Decisoes conscientes documentadas

### Infraestrutura
- [x] Docker + docker-compose
- [x] GitHub Actions CI/CD
- [x] Variaveis de ambiente

## Licenca

MIT
# crud-albuns
