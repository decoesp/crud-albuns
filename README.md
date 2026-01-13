# Sistema de Gerenciamento de Álbuns de Fotos

Sistema web para organização de fotos em álbuns com autenticação JWT, upload para storage S3-compatible, extração de metadados EXIF e compartilhamento público via link.

**Contexto**: Projeto desenvolvido como desafio técnico para demonstração de competências em desenvolvimento full-stack.

---

## 1. Visão Geral

### O que o sistema faz
- Permite criar e gerenciar álbuns de fotos
- Faz upload de imagens para storage S3-compatible (MinIO/AWS S3)
- Extrai metadados EXIF das fotos (data de aquisição, dimensões)
- Detecta cor predominante das imagens
- Compartilha álbuns publicamente via token único
- Autentica usuários via JWT ou OAuth (Google/GitHub)

### Problema que resolve
Organização básica de fotos em álbuns com controle de acesso e compartilhamento público seletivo.

### Limitações conhecidas
- Não há edição de imagens
- Não há busca por conteúdo ou tags
- Não há versionamento de fotos
- Não há sistema de permissões granulares (apenas owner/público)
- Não há compressão server-side (apenas client-side)

---

## 2. Escopo e Não-Escopo

### ✅ Implementado

**Backend**:
- Autenticação JWT com refresh token
- OAuth via Passport.js (Google e GitHub configurados, mas não testados em produção)
- CRUD de álbuns com soft delete
- Upload de fotos via signed URLs (direto para S3)
- Extração de metadados EXIF
- Detecção de cor predominante via Sharp
- Validação de entrada com Zod
- Rate limiting básico
- Security headers via Helmet
- Testes unitários e de integração (76 testes, 1 falhando no momento)

**Frontend**:
- Interface React com Tailwind CSS
- Compressão de imagens client-side com Web Worker
- Upload drag-and-drop
- Visualização em grid e tabela
- Paginação client-side
- React Query para cache
- Formulários com validação Zod
- Testes E2E com Cypress (básicos)

**Infraestrutura**:
- Docker Compose para desenvolvimento local
- GitHub Actions para CI (build e testes)

### ❌ NÃO Implementado

- **Produção real**: Não há deploy em produção, apenas setup local
- **CDN**: Imagens servidas diretamente do S3, sem CDN
- **Backup**: Não há estratégia de backup automatizado
- **Monitoramento**: Não há APM, logs centralizados ou alertas
- **Escalabilidade horizontal**: Aplicação não foi testada com múltiplas instâncias
- **Migração de dados**: Não há estratégia para migração entre ambientes
- **Busca avançada**: Não há Elasticsearch ou busca full-text
- **Processamento assíncrono**: Uploads e processamento são síncronos
- **Notificações**: Não há sistema de notificações (email, push, etc.)
- **Auditoria**: Não há log de ações do usuário
- **Métricas de negócio**: Não há analytics ou tracking

### ⚠️ Parcialmente Implementado

- **OAuth**: Código existe mas não foi testado end-to-end com credenciais reais
- **Recuperação de senha**: Fluxo implementado mas envio de email depende de SMTP configurado
- **Acessibilidade**: Labels e ARIA básicos, mas não foi testado com leitores de tela
- **Testes**: Cobertura parcial, focada em happy paths

---

## 3. Stack Tecnológica

### Backend
- **Runtime**: Node.js 20 + TypeScript 5
- **Framework**: Express.js 4
- **ORM**: Prisma 7 (com MySQL 8)
- **Autenticação**: jsonwebtoken + Passport.js
- **Validação**: Zod
- **Storage**: AWS SDK v3 (S3-compatible)
- **Processamento de Imagens**: Sharp + exif-parser
- **Testes**: Vitest + Supertest
- **Segurança**: Helmet, bcrypt, express-rate-limit

### Frontend
- **Framework**: React 18 + TypeScript 5
- **Build**: Vite 5
- **Estilização**: Tailwind CSS 3
- **State**: TanStack Query (React Query) v5
- **Formulários**: React Hook Form + Zod
- **Roteamento**: React Router DOM v6
- **Upload**: react-dropzone
- **Ícones**: Lucide React
- **Testes**: Vitest + Cypress

### Infraestrutura
- **Containers**: Docker + Docker Compose
- **CI**: GitHub Actions
- **Banco**: MySQL 8
- **Storage**: MinIO (desenvolvimento) / AWS S3 (produção teórica)

---

## 4. Arquitetura

### Backend - Camadas Reais

```
HTTP Request
    ↓
Middlewares (auth, rate-limit, security)
    ↓
Controllers (validação Zod, extração de params)
    ↓
Services (lógica de negócio)
    ↓
Repositories (acesso a dados via Prisma)
    ↓
Prisma Client
    ↓
MySQL
```

**Observações**:
- Controllers são finos (< 60 linhas), apenas delegam para services
- Services contêm lógica de negócio mas também fazem IO (S3, email)
- Repositories encapsulam Prisma mas não há abstração de ORM
- Domain layer existe mas é parcial (apenas tipos e validadores puros)

**Acoplamentos conhecidos**:
- Services acoplados ao Prisma (tipos vazam para camada de serviço)
- Não há inversão de dependência real (services instanciam repositories diretamente)
- S3 client é singleton global, não injetado
- Configuração de ambiente é global via `process.env`

### Frontend - Organização Real

```
Pages (rotas)
    ↓
Features (domínio: album, photo, auth)
    ├── API clients
    ├── React Query hooks
    └── Custom hooks
    ↓
Components (UI reutilizáveis)
    ↓
Lib (utils, api client, queryClient)
```

**Observações**:
- Estrutura híbrida: parte por features, parte por tipo de arquivo
- Componentes de UI são genéricos mas não há design system formal
- Hooks de domínio estão em `features/*/hooks/`
- Ainda existe duplicação residual entre `hooks/` e `features/*/hooks/`

**Limitações**:
- Não há separação clara entre container e presentational components
- Lógica de negócio às vezes vaza para componentes
- Não há camada de adaptação entre API e UI (tipos do backend são usados diretamente)

---

## 5. Fluxos Principais

### 5.1 Autenticação (JWT)

1. **Registro**:
   - Frontend envia `{ name, email, password }` para `POST /api/auth/register`
   - Backend valida com Zod (senha forte: 8+ chars, maiúscula, minúscula, número, especial)
   - Hasheia senha com bcrypt (12 rounds)
   - Cria usuário no banco
   - Retorna `{ accessToken, refreshToken, user }`

2. **Login**:
   - Frontend envia `{ email, password }` para `POST /api/auth/login`
   - Backend verifica email e compara hash
   - Gera JWT (expira em 15min) e refresh token (expira em 7 dias)
   - Retorna tokens

3. **Refresh**:
   - Frontend detecta 401 e chama `POST /api/auth/refresh` com refresh token
   - Backend valida token e gera novo par de tokens
   - Frontend retenta requisição original com novo access token

**Limitação**: Refresh tokens não são rotacionados (mesmo token pode ser reutilizado até expirar).

### 5.2 Criação de Álbum

1. Frontend envia `{ title, description? }` para `POST /api/albums`
2. Backend valida (title: 1-200 chars, description: max 2000 chars)
3. Cria registro no banco com `userId` do token JWT
4. Retorna álbum criado

**Fluxo real**: Síncrono, sem validação de duplicatas, sem limite de álbuns por usuário.

### 5.3 Upload de Fotos

1. **Geração de URL**:
   - Frontend chama `POST /api/albums/:id/photos/upload-url` com `{ filename, contentType }`
   - Backend verifica ownership do álbum
   - Gera signed URL do S3 (expira em 15min)
   - Retorna `{ uploadUrl, key }`

2. **Upload direto**:
   - Frontend comprime imagem com Web Worker (se suportado)
   - Faz PUT direto para signed URL do S3
   - Não passa pelo backend

3. **Registro da foto**:
   - Frontend chama `POST /api/albums/:id/photos` com metadados
   - Backend salva registro no banco
   - Extrai EXIF se disponível
   - Detecta cor predominante via Sharp
   - Retorna foto criada com URL de download

**Limitações**:
- Não valida se upload realmente aconteceu (confia no frontend)
- Não há cleanup de uploads incompletos
- Processamento de metadados é síncrono (bloqueia resposta)
- Não há limite de tamanho de arquivo (apenas client-side)

### 5.4 Compartilhamento Público

1. Frontend chama `POST /api/albums/:id/share` com `{ isPublic: true }`
2. Backend gera token único (UUID v4)
3. Atualiza álbum com `isPublic=true` e `shareToken`
4. Retorna `{ isPublic, shareToken }`
5. Frontend constrói URL pública: `/public/albums/:shareToken`

**Limitação**: Tokens não expiram, não há revogação parcial (apenas desativar compartilhamento inteiro).

---

## 6. Segurança

### O que é validado no backend

✅ **Validação de entrada**:
- Todos os endpoints validam payload com Zod
- Tipos são verificados em runtime
- Strings têm limites de tamanho

✅ **Autenticação**:
- JWT verificado em rotas protegidas
- Refresh tokens validados antes de gerar novos tokens
- Senhas hasheadas com bcrypt (12 rounds)

✅ **Autorização**:
- Ownership de álbuns verificado antes de operações
- Fotos só acessíveis pelo dono do álbum
- Álbuns públicos acessíveis apenas via share token válido

✅ **Rate Limiting**:
- Geral: 100 req/15min por IP
- Auth: 5 req/15min por IP
- Upload: 50 req/hora por IP
- API: 60 req/min por IP

✅ **Headers de segurança** (Helmet):
- CSP configurado
- HSTS habilitado
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### O que NÃO confia no frontend

❌ **Nunca confia**:
- Ownership de recursos (sempre verifica no banco)
- Validade de tokens (sempre verifica assinatura e expiração)
- Limites de tamanho (valida no backend também)
- Datas de aquisição (valida que não são futuras)

### Vulnerabilidades conhecidas

⚠️ **Limitações de segurança**:
- Não há proteção contra CSRF (aplicação SPA, mas deveria ter)
- Não há auditoria de ações sensíveis
- Não há detecção de força bruta além de rate limiting básico
- Não há validação de tipo de arquivo no backend (confia em `contentType`)
- Não há scanning de malware em uploads
- Tokens de compartilhamento não expiram
- Não há 2FA

---

## 7. Performance

### O que foi otimizado

✅ **Client-side**:
- Compressão de imagens com Web Worker (não bloqueia UI)
- Conversão para WebP (fallback JPEG)
- Redimensionamento para max 2048px
- Qualidade 80% (redução típica: 60-70%)
- React Query com cache de 1min
- Lazy loading de imagens (`loading="lazy"`)

✅ **Backend**:
- Upload direto para S3 (não passa pelo backend)
- Signed URLs com expiração
- Soft delete (queries filtram `deletedAt IS NULL`)

### O que NÃO escala

❌ **Limitações de escala**:
- **Processamento de metadados**: Síncrono, bloqueia resposta HTTP
  - Extração EXIF pode demorar 100-500ms por imagem
  - Detecção de cor predominante: 200-800ms por imagem
  - Não há fila de processamento assíncrono

- **Paginação**: Client-side no frontend, server-side no backend
  - Queries sem índices otimizados além de PK/FK
  - Não há cursor-based pagination (apenas offset)

- **Sessões**: Stateless (JWT), mas refresh tokens no banco
  - Consulta ao banco a cada refresh
  - Não há cache de sessões

- **Storage**: S3 sem CDN
  - Todas as imagens servidas diretamente do S3
  - Não há cache de thumbnails

- **Banco de dados**: Single instance MySQL
  - Não há read replicas
  - Não há sharding
  - Não há connection pooling configurado

### Trade-offs conscientes

| Decisão | Benefício | Custo |
|---------|-----------|-------|
| Compressão client-side | Reduz tráfego de rede | Depende de hardware do usuário |
| Upload direto S3 | Não sobrecarrega backend | Dificulta validação server-side |
| Processamento síncrono | Simplicidade de código | Não escala para alto volume |
| Soft delete | Recuperação de dados | Queries mais complexas |
| JWT stateless | Escalabilidade horizontal | Não há revogação imediata |

---

## 8. Acessibilidade (A11y)

### O que foi implementado

✅ **Labels e ARIA**:
- Todos os inputs têm `<label>` com `htmlFor`/`id`
- Erros de formulário com `aria-describedby` e `role="alert"`
- Campos inválidos com `aria-invalid="true"`
- Botões com `aria-label` quando texto não é suficiente
- Ícones decorativos com `aria-hidden="true"`
- Modais com `role="dialog"`, `aria-modal`, `aria-labelledby`

✅ **Navegação por teclado**:
- Todos os elementos interativos são focáveis
- Ordem de tabulação lógica (tab index natural)
- Modais com focus trap
- Estados de foco visíveis (`focus-visible:ring`)

✅ **Feedback visual**:
- Loading states com spinner e `aria-busy`
- Mensagens de sucesso/erro com toast
- Estados disabled visualmente distintos

### O que NÃO foi implementado

❌ **Limitações de A11y**:
- **Skip links**: Não há links para pular navegação
- **Landmarks**: Não há uso consistente de `<nav>`, `<main>`, `<aside>`
- **Headings**: Hierarquia de headings não foi auditada
- **Contraste**: Não foi verificado com ferramenta automatizada
- **Screen reader**: Não foi testado com NVDA/JAWS/VoiceOver
- **Redução de movimento**: Não há suporte a `prefers-reduced-motion`
- **Zoom**: Não foi testado com zoom de 200%
- **Alto contraste**: Não há modo de alto contraste

### Decisões conscientes

| Item | Status | Justificativa |
|------|--------|---------------|
| Skip links | Não implementado | SPA com navegação simples, baixa prioridade |
| Screen reader testing | Recomendado antes de produção | Requer testes manuais com usuários reais |
| Contraste | Parcial | Tailwind tem bom contraste padrão, mas não auditado |

---

## 9. Testes

### Tipos de testes existentes

**Backend** (Vitest):
- **Unitários**: 41 testes
  - Domain operations (album, photo validators)
  - Utility functions (asyncHandler)
  - Services (auth, album, photo) com mocks

- **Integração**: 35 testes
  - Rotas de autenticação (register, login, refresh, forgot password)
  - Rotas de álbuns (CRUD, share)
  - Rotas de fotos (upload URL, create, delete)

**Frontend**:
- **Unitários**: ~10 testes
  - Token storage
  - Album API client
  
- **E2E** (Cypress): 3 specs
  - Autenticação (login, register, protected routes)
  - Álbuns (criação, listagem)
  - Upload (básico)

### O que é coberto

✅ **Backend**:
- Happy paths de autenticação
- CRUD básico de álbuns e fotos
- Validação de ownership
- Erros de NotFound, Forbidden
- Domain validators (datas de aquisição)

✅ **Frontend**:
- Fluxo de login/register
- Navegação básica
- Proteção de rotas

### O que NÃO é coberto

❌ **Backend**:
- OAuth flows (Google/GitHub)
- Envio de email (forgot password)
- Processamento de EXIF real
- Detecção de cor predominante
- Integração real com S3
- Rate limiting
- Security headers
- Cenários de erro de rede/timeout

❌ **Frontend**:
- Compressão de imagens (Web Worker)
- Upload real para S3
- Paginação
- Compartilhamento público
- Edição de álbuns/fotos
- Estados de erro complexos
- Acessibilidade (keyboard navigation, screen readers)

### Limitações da estratégia de testes

⚠️ **Problemas conhecidos**:
- **1 teste falhando**: `album.service.test.ts > getById > should return album for owner`
  - Erro: `Cannot read properties of undefined (reading 'map')`
  - Mock incompleto de `album.photos`
  - **Não foi corrigido**

- **Mocks excessivos**: Services testados com mocks de repositories
  - Testes não garantem integração real com banco
  - Mudanças no Prisma podem quebrar em produção sem testes falharem

- **Cobertura parcial**: ~60% do código backend, ~20% do frontend
  - Focado em happy paths
  - Poucos testes de edge cases

- **E2E frágeis**: Dependem de estado do banco
  - Não há reset automático entre testes
  - Podem falhar por timing issues

- **Sem testes de carga**: Não há testes de performance ou stress

---

## 10. Setup Local

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Git

### Passo a passo

1. **Clone o repositório**:
```bash
git clone <repo-url>
cd crud-albuns
```

2. **Configure variáveis de ambiente**:
```bash
# Backend
cp backend/.env.example backend/.env
# Edite backend/.env com suas configurações

# Frontend
cp frontend/.env.example frontend/.env
# Edite frontend/.env se necessário
```

3. **Inicie serviços de infraestrutura**:
```bash
docker-compose up -d mysql minio
```

4. **Configure MinIO** (storage S3-compatible):
```bash
# Acesse http://localhost:9001
# Login: minioadmin / minioadmin
# Crie bucket: photo-album
# Configure política pública para download
```

Ou via CLI:
```bash
docker exec photo-album-minio sh -c "mc alias set myminio http://localhost:9000 minioadmin minioadmin && mc mb myminio/photo-album && mc anonymous set download myminio/photo-album"
```

5. **Setup do backend**:
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```

**Observação**: Prisma 7 mudou configuração de datasource. URL do banco é passada no construtor do `PrismaClient`, não no `schema.prisma`.

6. **Setup do frontend**:
```bash
cd frontend
npm install
npm run dev
```

7. **Acesse**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- MinIO Console: http://localhost:9001

### Observações importantes

⚠️ **OAuth não funcionará** sem configurar credenciais reais:
- Google: Criar app em Google Cloud Console
- GitHub: Criar OAuth App em GitHub Settings
- Configurar callback URLs e secrets no `.env`

⚠️ **Email não funcionará** sem SMTP configurado:
- Recuperação de senha depende de servidor SMTP
- Configure `SMTP_*` no `.env` ou use serviço como Mailtrap para testes

⚠️ **Testes**:
```bash
# Backend
cd backend
npm run test              # Unitários + integração (1 teste falhando)

# Frontend
cd frontend
npm run test              # Unitários
npm run cypress:open      # E2E interativo
```

---

## 11. Estado de Maturidade do Projeto

### Por que este projeto NÃO é production-ready

❌ **Bloqueadores críticos**:

1. **Teste falhando**: 1 teste unitário quebrado não foi corrigido
2. **OAuth não testado**: Código existe mas nunca foi executado com credenciais reais
3. **Sem monitoramento**: Não há logs centralizados, APM ou alertas
4. **Sem backup**: Não há estratégia de backup do banco ou S3
5. **Processamento síncrono**: Metadados EXIF/cor bloqueiam resposta HTTP
6. **Sem rate limiting real**: Limitação por IP é facilmente contornável
7. **Sem CDN**: Imagens servidas diretamente do S3
8. **Sem auditoria**: Não há log de ações sensíveis
9. **Vulnerabilidades**: CSRF, falta de 2FA, tokens sem expiração

### O que faltaria para produção real

**Infraestrutura**:
- [ ] Deploy em cloud provider (AWS/GCP/Azure)
- [ ] Load balancer com SSL/TLS
- [ ] CDN para assets estáticos e imagens
- [ ] Banco de dados gerenciado com backups automáticos
- [ ] Redis para cache e sessões
- [ ] Fila de mensagens (SQS/RabbitMQ) para processamento assíncrono

**Observabilidade**:
- [ ] APM (New Relic/Datadog/Sentry)
- [ ] Logs centralizados (CloudWatch/Elasticsearch)
- [ ] Métricas de negócio (analytics)
- [ ] Alertas para erros críticos
- [ ] Health checks e readiness probes

**Segurança**:
- [ ] WAF (Web Application Firewall)
- [ ] Proteção CSRF
- [ ] 2FA para usuários
- [ ] Scanning de malware em uploads
- [ ] Auditoria de ações sensíveis
- [ ] Rotação de secrets
- [ ] Penetration testing

**Qualidade**:
- [ ] Cobertura de testes > 80%
- [ ] Testes de carga e stress
- [ ] Testes de acessibilidade com usuários reais
- [ ] Code review process
- [ ] Documentação de API (Swagger/OpenAPI)

**Funcional**:
- [ ] Processamento assíncrono de imagens
- [ ] Thumbnails automáticos
- [ ] Busca avançada
- [ ] Notificações
- [ ] Versionamento de fotos
- [ ] Permissões granulares

---

## 12. Trade-offs e Decisões Técnicas

### Decisões conscientes

| Decisão | Motivação | Consequência |
|---------|-----------|--------------|
| **Compressão client-side** | Reduzir tráfego de rede e carga no backend | Depende de hardware do usuário, inconsistência de qualidade |
| **Upload direto S3** | Escalabilidade, não sobrecarregar backend | Dificulta validação server-side, possível abuse |
| **JWT stateless** | Simplicidade, escalabilidade horizontal | Não há revogação imediata de tokens |
| **Soft delete** | Recuperação de dados, auditoria básica | Queries mais complexas, limpeza manual necessária |
| **Processamento síncrono** | Simplicidade de código, menos infraestrutura | Não escala, bloqueia resposta HTTP |
| **Prisma ORM** | Produtividade, type-safety | Vendor lock-in, queries complexas difíceis |
| **React Query** | Cache automático, menos boilerplate | Curva de aprendizado, debugging complexo |
| **Tailwind CSS** | Velocidade de desenvolvimento | HTML verboso, difícil customização profunda |
| **Monorepo simples** | Facilidade de setup local | Não há versionamento independente de frontend/backend |

### O que foi priorizado

✅ **Alta prioridade**:
- Funcionalidade básica completa (CRUD, upload, compartilhamento)
- Segurança essencial (autenticação, autorização, validação)
- Developer experience (TypeScript, hot reload, Docker)
- Testes de happy paths

### O que ficou de fora

❌ **Baixa prioridade** (consciente):
- Escalabilidade horizontal
- Processamento assíncrono
- Monitoramento e observabilidade
- Testes de edge cases
- Documentação de API
- Internacionalização
- Temas (dark mode)

---

## Estrutura de Arquivos

```
crud-albuns/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/          # Env, S3, Passport, Database
│   │   ├── controllers/     # HTTP handlers (finos, < 60 linhas)
│   │   ├── domain/          # Tipos, validators, mappers puros
│   │   │   ├── album/
│   │   │   ├── photo/
│   │   │   └── user/
│   │   ├── middlewares/     # Auth, error, rate-limit, security
│   │   ├── repositories/    # Acesso a dados (Prisma)
│   │   ├── routes/          # Definição de rotas Express
│   │   ├── schemas/         # Validação Zod
│   │   ├── services/        # Lógica de negócio
│   │   ├── tests/           # Testes unitários e integração
│   │   ├── types/           # Tipos TypeScript globais
│   │   ├── utils/           # asyncHandler, errors, jwt
│   │   ├── app.ts
│   │   └── server.ts
│   └── package.json
├── frontend/
│   ├── cypress/             # Testes E2E
│   ├── src/
│   │   ├── components/      # UI reutilizáveis
│   │   │   ├── album/       # AlbumCard, CreateModal, etc
│   │   │   └── ui/          # Button, Input, Modal, etc
│   │   ├── contexts/        # AuthContext
│   │   ├── features/        # Módulos por domínio
│   │   │   ├── album/       # API, hooks, queries
│   │   │   ├── auth/
│   │   │   └── photo/
│   │   ├── hooks/           # Hooks compartilhados
│   │   ├── lib/             # api, tokenStorage, queryClient, utils
│   │   ├── pages/           # Páginas/rotas
│   │   ├── workers/         # Web Workers (compressão)
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
├── docker-compose.yml
└── README.md
```

---

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `POST /api/auth/forgot-password` - Solicitar reset
- `POST /api/auth/reset-password` - Redefinir senha
- `GET /api/auth/profile` - Perfil do usuário
- `GET /api/auth/google` - OAuth Google (não testado)
- `GET /api/auth/github` - OAuth GitHub (não testado)

### Álbuns
- `GET /api/albums` - Listar (paginado)
- `POST /api/albums` - Criar
- `GET /api/albums/:id` - Detalhes
- `PATCH /api/albums/:id` - Atualizar
- `DELETE /api/albums/:id` - Excluir (soft delete)
- `POST /api/albums/:id/share` - Compartilhar/descompartilhar

### Fotos
- `GET /api/albums/:albumId/photos` - Listar (paginado)
- `POST /api/albums/:albumId/photos` - Criar registro
- `POST /api/albums/:albumId/photos/upload-url` - Gerar signed URL
- `POST /api/albums/:albumId/photos/batch-upload-url` - URLs em lote
- `GET /api/albums/:albumId/photos/:id` - Detalhes
- `PATCH /api/albums/:albumId/photos/:id` - Atualizar
- `DELETE /api/albums/:albumId/photos/:id` - Excluir (soft delete)

### Público
- `GET /api/public/albums/:shareToken` - Álbum compartilhado

---

## Licença

MIT
