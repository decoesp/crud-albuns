# Photo Album - Sistema de Gerenciamento de Álbuns de Fotos

## 1. Visão Geral

Sistema web para gerenciamento de álbuns de fotos com autenticação, upload de imagens, compartilhamento público e extração de metadados EXIF. Desenvolvido como projeto de demonstração técnica.

**Contexto:** Este é um projeto de portfólio/demonstração técnica, não um sistema em produção. Foi desenvolvido para demonstrar competências em arquitetura full-stack, boas práticas de engenharia e qualidade de código.

**Problema que resolve:** Permite usuários organizarem fotos em álbuns, extraírem metadados automaticamente (EXIF, dimensões, cor dominante) e compartilharem álbuns publicamente via link.

---

## 2. Escopo e Não-Escopo

### O que ESTÁ implementado

**Backend:**
- Autenticação JWT (access + refresh tokens)
- OAuth 2.0 (Google e GitHub) via Passport.js
- CRUD completo de álbuns e fotos
- Upload de imagens para S3-compatible storage (MinIO/AWS S3)
- Extração de metadados EXIF com `exif-parser`
- Análise de cor dominante com `sharp.stats()`
- Compartilhamento público de álbuns via token único
- Soft delete (deleção lógica)
- Rate limiting por IP e por usuário
- Validação de dados com Zod
- Recuperação de senha via email
- Logs estruturados
- Testes unitários (76 testes)
- Testes de integração (27 testes)

**Frontend:**
- Interface React 18 + TypeScript
- Autenticação com armazenamento de tokens
- Compressão de imagens no client-side com Web Workers
- Upload em lote com preview
- Edição de metadados de fotos
- Visualização de álbuns públicos (sem autenticação)
- Lazy loading de imagens
- Testes unitários (42 testes)
- Testes E2E com Cypress

**Infraestrutura:**
- Docker Compose para ambiente local
- GitHub Actions CI/CD
- Migrations com Prisma

### O que NÃO está implementado

**Funcionalidades ausentes:**
- Busca full-text de fotos/álbuns
- Tags ou categorização avançada
- Reconhecimento facial ou IA
- Edição de imagens (crop, filtros, etc.)
- Versionamento de fotos
- Comentários ou colaboração
- Notificações push
- Integração com redes sociais
- Backup automático
- Geolocalização de fotos

**Limitações técnicas conscientes:**
- Não há CDN para servir imagens (URLs S3 diretas)
- Não há otimização de imagens em múltiplos tamanhos (thumbnails, etc.)
- Não há sistema de filas para processamento assíncrono
- Não há cache distribuído (Redis)
- Não há monitoramento/observabilidade (Prometheus, Grafana)
- Não há testes de carga ou benchmarks
- Não há estratégia de disaster recovery
- OAuth não persiste sessões entre restarts do servidor

**Escalabilidade:**
- Backend roda em single instance (não há load balancer)
- Banco de dados não tem réplicas
- Upload de arquivos grandes (>10MB) pode causar timeout
- Processamento de metadados é síncrono (bloqueia a request)
- Não há limite de storage por usuário

---

## 3. Stack Tecnológica

### Backend
- **Runtime:** Node.js 20 + TypeScript
- **Framework:** Express.js
- **ORM:** Prisma
- **Banco de dados:** MySQL 8
- **Autenticação:** jsonwebtoken + Passport.js (Google/GitHub OAuth)
- **Validação:** Zod
- **Storage:** AWS S3 / MinIO (S3-compatible)
- **Processamento de imagens:** sharp, exif-parser
- **Segurança:** Helmet, bcrypt, express-rate-limit
- **Testes:** Vitest + Supertest
- **Logs:** Winston

### Frontend
- **Framework:** React 18 + TypeScript
- **Build:** Vite
- **Roteamento:** React Router v6
- **Estado:** React Query (TanStack Query)
- **Formulários:** React Hook Form + Zod
- **Estilização:** Tailwind CSS
- **Compressão de imagens:** browser-image-compression + Web Workers
- **Testes:** Vitest + Cypress
- **Notificações:** react-hot-toast

### Infraestrutura
- **Containerização:** Docker + Docker Compose
- **CI/CD:** GitHub Actions
- **Proxy reverso (local):** Nginx

---

## 4. Arquitetura

### Organização do Backend

```
backend/src/
├── config/          # Configurações (DB, S3, Passport, env)
├── controllers/     # Handlers de requisições HTTP
├── domain/          # Lógica de negócio pura (operations, validators, mappers)
├── middlewares/     # Auth, rate-limit, error handling, security
├── repositories/    # Acesso a dados (Prisma)
├── routes/          # Definição de rotas Express
├── schemas/         # Validação Zod
├── services/        # Orquestração de lógica de negócio
├── types/           # Tipos TypeScript
├── utils/           # Helpers (JWT, password, logger, errors)
└── tests/           # Testes unitários e de integração
```

**Camadas:**
1. **Routes** → definem endpoints e aplicam middlewares
2. **Controllers** → recebem requisições, chamam services, retornam respostas
3. **Services** → orquestram lógica de negócio, chamam repositories
4. **Domain** → funções puras de validação e transformação
5. **Repositories** → acesso direto ao Prisma

**Acoplamentos existentes:**
- Services conhecem estrutura do Prisma (tipos `@prisma/client`)
- Controllers têm lógica de mapeamento de erros HTTP
- Não há camada de DTOs explícita (schemas Zod servem como contratos)
- Upload de arquivos é síncrono (não usa filas)

### Organização do Frontend

```
frontend/src/
├── components/      # Componentes reutilizáveis (Layout, Button, Modal, etc.)
├── contexts/        # Context API (AuthContext)
├── features/        # Módulos por domínio (album, auth)
│   ├── album/
│   │   ├── api/     # Chamadas HTTP
│   │   ├── hooks/   # React Query hooks
│   │   └── types/   # Tipos TypeScript
├── hooks/           # Hooks compartilhados
├── lib/             # Configurações (axios, queryClient)
├── pages/           # Páginas/rotas
├── utils/           # Helpers
└── workers/         # Web Workers (compressão de imagens)
```

**Padrões:**
- Hooks customizados para lógica de estado
- React Query para cache e sincronização com backend
- Context API para autenticação global
- Web Workers para processamento pesado (compressão)

**Limitações:**
- Não há state management global (Redux/Zustand)
- Não há lazy loading de rotas (code splitting)
- Não há tratamento de offline/PWA
- Não há retry automático de uploads falhados

---

## 5. Fluxos Principais

### 5.1 Autenticação (Email/Senha)

1. **Registro:**
   - Frontend envia `POST /api/auth/register` com `{ name, email, password }`
   - Backend valida com Zod (senha: min 8 chars, uppercase, lowercase, número, especial)
   - Senha é hasheada com bcrypt (10 rounds)
   - Usuário é criado no banco
   - Retorna `accessToken` (15min) e `refreshToken` (7 dias)
   - Tokens são armazenados no `localStorage` do navegador

2. **Login:**
   - Frontend envia `POST /api/auth/login` com `{ email, password }`
   - Backend busca usuário, compara senha com bcrypt
   - Retorna tokens JWT
   - Rate limit: 50 tentativas/15min (desenvolvimento)

3. **Refresh Token:**
   - Frontend detecta token expirado (401)
   - Envia `POST /api/auth/refresh` com `refreshToken`
   - Backend valida token e verifica se está salvo no banco
   - Retorna novos tokens
   - **Limitação:** Se o servidor reiniciar, refresh tokens antigos são invalidados

### 5.2 Autenticação OAuth (Google/GitHub)

1. Frontend redireciona para `/api/auth/google` ou `/api/auth/github`
2. Passport.js gerencia fluxo OAuth
3. Backend cria ou atualiza usuário com `provider` e `providerId`
4. Retorna tokens JWT
5. Frontend armazena tokens

**Limitação:** Não há persistência de sessão OAuth entre restarts do servidor.

### 5.3 Criação de Álbum e Upload de Fotos

1. **Criar álbum:**
   - `POST /api/albums` com `{ title, description }`
   - Backend cria registro no banco
   - Retorna álbum criado

2. **Obter URL de upload:**
   - Frontend comprime imagens localmente (Web Worker)
   - `POST /api/albums/:id/photos/upload-url` com `{ filename, contentType }`
   - Backend gera presigned URL do S3 (válida por 1h)
   - Retorna `{ uploadUrl, key }`

3. **Upload direto para S3:**
   - Frontend faz `PUT` para `uploadUrl` com arquivo binário
   - S3 armazena arquivo
   - **Não passa pelo backend** (economia de banda)

4. **Registrar foto no banco:**
   - `POST /api/albums/:id/photos` com metadados `{ title, s3Key, filename, size, mimeType }`
   - Backend valida ownership do álbum
   - Cria registro da foto
   - Retorna foto com URL de download (presigned)

5. **Processar metadados (opcional):**
   - `POST /api/albums/:id/photos/:photoId/process-metadata`
   - Backend baixa imagem do S3
   - Extrai EXIF com `exif-parser`
   - Calcula cor dominante com `sharp.stats()`
   - Atualiza registro da foto
   - **Limitação:** Processamento é síncrono, pode causar timeout em imagens grandes

### 5.4 Compartilhamento Público

1. `POST /api/albums/:id/share` com `{ isPublic: true }`
2. Backend gera `shareToken` único (UUID)
3. Retorna `{ shareToken, shareUrl }`
4. Qualquer pessoa com o link pode acessar `GET /api/albums/shared/:shareToken`
5. **Não requer autenticação**

---

## 6. Segurança

### O que é validado no backend

**Autenticação:**
- Todos os endpoints (exceto `/auth/*` e `/albums/shared/*`) requerem JWT válido
- Tokens são verificados com `jsonwebtoken.verify()`
- Refresh tokens são comparados com valor salvo no banco (prevenção de reuso)

**Autorização:**
- Álbuns: Apenas o dono pode visualizar, editar ou deletar
- Fotos: Verificação de ownership via `album.userId`
- Compartilhamento: Apenas o dono pode tornar álbum público

**Validação de entrada:**
- Todos os payloads são validados com Zod antes de processar
- Senhas: min 8 chars, uppercase, lowercase, número, especial
- Emails: formato RFC válido
- Datas de aquisição: não podem ser futuras

**Proteções implementadas:**
- Rate limiting por IP (100 req/15min geral, 50 req/15min auth)
- Rate limiting por usuário (50 uploads/hora, 10 operações sensíveis/hora)
- Helmet.js (CSP, HSTS, X-Frame-Options, etc.)
- CORS restrito ao `FRONTEND_URL`
- Soft delete (dados não são removidos fisicamente)
- Passwords hasheadas com bcrypt (10 rounds)
- JWT secrets com min 32 caracteres
- Presigned URLs do S3 expiram em 1 hora

**O que NÃO confia no frontend:**
- Ownership de recursos (sempre verifica no banco)
- Permissões de acesso
- Validação de tipos de arquivo (valida MIME type no backend)
- Tamanho de arquivos (S3 tem limite configurável)

### Vulnerabilidades conhecidas

**Não mitigadas:**
- Não há proteção contra CSRF (tokens não são cookies)
- Não há 2FA
- Não há detecção de atividade suspeita
- Não há rate limiting por conta (apenas por IP)
- Não há sanitização de nomes de arquivo (apenas validação de extensão)
- Não há verificação de vírus em uploads
- Logs não são auditados para compliance

---

## 7. Performance

### O que foi otimizado

**Frontend:**
- Compressão de imagens no client-side (reduz ~60-70% do tamanho)
- Web Workers para não bloquear UI durante compressão
- React Query para cache de requisições
- Lazy loading de imagens com `loading="lazy"`
- Debounce em campos de busca (não implementado ainda)

**Backend:**
- Upload direto para S3 (não passa pelo backend)
- Presigned URLs (economia de processamento)
- Soft delete (queries mais rápidas que hard delete)
- Índices no banco: `userId`, `albumId`, `shareToken`, `email`

### O que NÃO escala

**Limitações de escala:**
- Processamento de metadados é síncrono (bloqueia request)
- Não há sistema de filas (RabbitMQ, SQS)
- Não há cache distribuído (Redis)
- Não há paginação de fotos dentro de álbuns (carrega todas)
- Não há thumbnails (sempre serve imagem full-size)
- Banco de dados single instance (sem réplicas)
- Backend single instance (sem load balancer)

**Estimativa de capacidade:**
- Upload simultâneo: ~10-20 usuários (limitado por memória do Node.js)
- Fotos por álbum: ~100-200 (depois disso, UI fica lenta)
- Usuários ativos: ~100-500 (sem cache, banco vira gargalo)

### Trade-offs conscientes

**Compressão client-side vs server-side:**
- ✅ Escolhido: Client-side
- ✅ Vantagem: Reduz banda de upload, desafoga backend
- ❌ Desvantagem: Depende de hardware do usuário, não funciona em mobile antigo

**Upload direto S3 vs proxy pelo backend:**
- ✅ Escolhido: Direto S3
- ✅ Vantagem: Escalabilidade, economia de banda
- ❌ Desvantagem: Não há validação de conteúdo antes do upload

**Processamento síncrono vs assíncrono:**
- ❌ Escolhido: Síncrono (atual)
- ❌ Desvantagem: Timeout em imagens grandes, não escala
- ✅ Deveria ser: Fila assíncrona (SQS + Lambda ou worker)

---

## 8. Acessibilidade (A11y)

### O que foi implementado

**Semântica HTML:**
- Tags semânticas (`<nav>`, `<main>`, `<section>`, `<button>`)
- Hierarquia de headings (`<h1>`, `<h2>`, etc.)

**ARIA:**
- `aria-label` em botões de ícone
- `aria-hidden` em ícones decorativos
- `role="button"` onde necessário

**Teclado:**
- Navegação por Tab funciona
- Enter/Space ativam botões
- Escape fecha modais

**Contraste:**
- Cores seguem WCAG AA (não auditado formalmente)

### O que NÃO foi implementado

**Ausências:**
- Não há suporte a screen readers (não testado)
- Não há `aria-live` para notificações dinâmicas
- Não há `aria-describedby` para erros de formulário
- Não há skip links
- Não há modo de alto contraste
- Não há suporte a zoom (pode quebrar layout)
- Não há alternativas textuais para imagens (alt tags vazias)
- Não há testes automatizados de a11y (axe, pa11y)

**Decisão consciente:** A11y foi considerada, mas não é prioritária neste projeto de demonstração. Para produção real, seria necessário auditoria completa e testes com usuários reais.

---

## 9. Testes

### Tipos de testes existentes

**Backend:**
- **Unitários (76 testes):** Services, domain logic, validators
  - Framework: Vitest
  - Cobertura: ~70% (estimativa, não medida)
  - Mocks: Repositories, utils (JWT, password, email)
  - Exemplo: `auth.service.test.ts`, `album.service.test.ts`

- **Integração (27 testes):** Rotas HTTP end-to-end
  - Framework: Vitest + Supertest
  - Banco: MySQL real (limpo entre testes)
  - Exemplo: `auth.integration.test.ts`, `album.integration.test.ts`
  - **Limitação:** Testes rodam sequencialmente (não paralelos) para evitar race conditions

**Frontend:**
- **Unitários (42 testes):** Hooks, utils, componentes
  - Framework: Vitest + Testing Library
  - Mocks: API calls, React Query
  - Exemplo: `useAlbumQueries.test.ts`

- **E2E (Cypress):** Fluxos completos de usuário
  - Cenários: Login, registro, criação de álbum
  - **Limitação:** Não roda no CI (apenas local)

### O que NÃO é coberto

**Gaps de cobertura:**
- Controllers (apenas testes de integração)
- Middlewares (parcialmente testados)
- Repositories (não testados diretamente)
- Configurações (S3, Passport, env)
- Workers (compressão de imagens)
- Componentes React (maioria não testada)
- Fluxos de erro (ex: S3 indisponível)

**Testes ausentes:**
- Performance/carga (k6, Artillery)
- Segurança (OWASP ZAP, Burp Suite)
- Acessibilidade (axe, pa11y)
- Cross-browser (apenas Chrome testado)
- Mobile (não testado)

### Limitações da estratégia

**Problemas conhecidos:**
- Testes de integração são lentos (~15-20s)
- Não há CI para testes E2E (Cypress)
- Não há testes de contrato (Pact)
- Não há testes de mutação
- Cobertura não é medida automaticamente
- Testes não rodam em paralelo (backend)

---

## 10. Setup Local

### Pré-requisitos

- Node.js 20+
- Docker + Docker Compose
- Git

### Passo a passo

```bash
# 1. Clonar repositório
git clone https://github.com/decoesp/crud-albuns.git
cd crud-albuns

# 2. Subir infraestrutura (MySQL + MinIO)
docker-compose up -d

# 3. Backend
cd backend
cp .env.example .env
# Editar .env com valores reais (JWT secrets, etc.)
npm install
npx prisma migrate dev
npx prisma generate
npm run dev  # Porta 3001

# 4. Frontend (em outro terminal)
cd frontend
npm install
npm run dev  # Porta 5173

# 5. Acessar aplicação
# http://localhost:5173
```

### Variáveis de ambiente obrigatórias

**Backend (.env):**
```
DATABASE_URL=mysql://root:password@localhost:3306/photo_album
JWT_SECRET=<min-32-chars>
JWT_REFRESH_SECRET=<min-32-chars>
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=photo-albums
FRONTEND_URL=http://localhost:5173
```

**Frontend (.env):**
```
VITE_API_URL=http://localhost:3001
```

### Rodando testes

```bash
# Backend
cd backend
npm run test              # Unitários
npm run test:integration  # Integração
npm run lint

# Frontend
cd frontend
npm run test              # Unitários
npm run test:e2e          # Cypress (requer app rodando)
npm run lint
```

### Docker build

```bash
# Backend
docker build -t photo-album-backend ./backend

# Frontend
docker build -t photo-album-frontend ./frontend
```

**Observação:** Backend roda com `tsx` (não compilado) para evitar erros de tipo não-críticos. Para produção real, seria necessário corrigir todos os erros TypeScript.

---

## 11. Estado de Maturidade do Projeto

### Por que este projeto NÃO é production-ready

**Infraestrutura:**
- Não há monitoramento (Prometheus, Grafana, Sentry)
- Não há logs centralizados (ELK, Datadog)
- Não há alertas
- Não há backup automatizado
- Não há disaster recovery
- Não há multi-region
- Não há CDN
- Não há WAF

**Escalabilidade:**
- Backend single instance
- Banco single instance
- Sem cache distribuído
- Sem filas assíncronas
- Processamento síncrono

**Segurança:**
- Não há 2FA
- Não há auditoria de logs
- Não há detecção de intrusão
- Não há rate limiting por conta
- Não há verificação de vírus
- OAuth não persiste sessões

**Qualidade:**
- Cobertura de testes ~60-70% (não medida)
- Testes E2E não rodam no CI
- Não há testes de carga
- Não há testes de segurança
- TypeScript tem erros de tipo (não bloqueantes)

**Operacional:**
- Não há runbooks
- Não há documentação de incidentes
- Não há SLAs definidos
- Não há processo de deploy
- Não há rollback automatizado
- Não há feature flags

### O que faltaria para produção real

**Curto prazo (1-2 meses):**
1. Corrigir todos os erros TypeScript
2. Aumentar cobertura de testes para 80%+
3. Implementar monitoramento básico (Sentry)
4. Adicionar logs estruturados centralizados
5. Implementar backup automatizado
6. Adicionar testes de carga
7. Documentar runbooks

**Médio prazo (3-6 meses):**
1. Implementar filas assíncronas (SQS + workers)
2. Adicionar cache distribuído (Redis)
3. Implementar CDN para imagens
4. Adicionar thumbnails automáticos
5. Implementar 2FA
6. Adicionar rate limiting por conta
7. Implementar feature flags
8. Adicionar testes de segurança automatizados

**Longo prazo (6-12 meses):**
1. Multi-region deployment
2. Disaster recovery testado
3. Compliance (GDPR, LGPD)
4. Auditoria de segurança externa
5. Testes de penetração
6. SLAs definidos e monitorados
7. Processo de incident response

---

## 12. Trade-offs e Decisões Técnicas

### Decisões arquiteturais

**1. Monolito vs Microserviços**
- ✅ Escolhido: Monolito
- Razão: Simplicidade, baixa complexidade operacional
- Trade-off: Escalabilidade limitada, deploy all-or-nothing

**2. REST vs GraphQL**
- ✅ Escolhido: REST
- Razão: Simplicidade, familiaridade, menos overhead
- Trade-off: Overfetching, múltiplas requests

**3. SQL vs NoSQL**
- ✅ Escolhido: MySQL (SQL)
- Razão: Relações claras (user → album → photo), ACID
- Trade-off: Escalabilidade horizontal limitada

**4. Prisma vs TypeORM vs Knex**
- ✅ Escolhido: Prisma
- Razão: Type-safety, migrations, developer experience
- Trade-off: Menos controle sobre queries, overhead

**5. JWT vs Session**
- ✅ Escolhido: JWT
- Razão: Stateless, escalabilidade, mobile-friendly
- Trade-off: Não há revogação instantânea, tamanho do token

**6. Client-side compression vs Server-side**
- ✅ Escolhido: Client-side
- Razão: Reduz banda, desafoga backend
- Trade-off: Depende de hardware do usuário

**7. Direct S3 upload vs Proxy**
- ✅ Escolhido: Direct S3
- Razão: Escalabilidade, economia de banda
- Trade-off: Não há validação de conteúdo antes do upload

**8. Soft delete vs Hard delete**
- ✅ Escolhido: Soft delete
- Razão: Recuperação de dados, auditoria
- Trade-off: Complexidade em queries, storage

**9. TypeScript strict mode**
- ❌ Escolhido: Não (strict: false no tsconfig)
- Razão: Erros de tipo não-críticos bloqueavam build
- Trade-off: Menos type-safety, possíveis bugs em runtime
- **Nota:** Deveria ser corrigido para produção

### Priorização consciente

**O que foi priorizado:**
1. Funcionalidade core (CRUD, auth, upload)
2. Testes automatizados
3. Segurança básica (JWT, bcrypt, rate limiting)
4. Developer experience (TypeScript, Prisma, hot reload)

**O que ficou de fora:**
1. Performance avançada (cache, CDN, thumbnails)
2. Escalabilidade (filas, workers, load balancer)
3. Observabilidade (monitoramento, logs centralizados)
4. Acessibilidade completa
5. Internacionalização (i18n)

---

## Conclusão

Este é um projeto de demonstração técnica que implementa funcionalidades core de um sistema de gerenciamento de fotos com qualidade de código acima da média, mas **não está pronto para produção**.

**Pontos fortes:**
- Arquitetura limpa e organizada
- Testes automatizados (103 testes)
- Segurança básica implementada
- Type-safety com TypeScript
- CI/CD funcional

**Limitações críticas:**
- Não escala além de ~100-500 usuários
- Sem monitoramento ou observabilidade
- Sem filas assíncronas
- Sem cache distribuído
- TypeScript não está em strict mode

**Uso recomendado:** Portfólio, aprendizado, base para projetos maiores. Não usar em produção sem as melhorias listadas na seção 11.
