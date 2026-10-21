# Atividade-CI-CD-Workflow

CRUD de pessoas (**CPF**, **nome**, **data de nascimento** e **idade calculada**) desenvolvido com **TDD**,
versionamento com Git, análise estática, formatação, testes unitários e de integração, pipeline de CI e imagens Docker.

**Stack:** Next.js 16 (frontend) · Express 4 (API) · PostgreSQL 16 · Jest · ESLint · Prettier · Docker · GitHub Actions

## Estrutura

```
.
├── backend/               # API Express + PostgreSQL
│   ├── src/
│   │   ├── domain/        # regras puras: cpf.js (validação) e idade.js (cálculo)
│   │   ├── services/      # casos de uso do CRUD (pessoaService.js)
│   │   ├── repositories/  # acesso ao PostgreSQL (pessoaRepository.js)
│   │   ├── db/            # pool e migração
│   │   ├── app.js         # rotas HTTP
│   │   └── server.js      # entrypoint
│   └── tests/
│       ├── unit/          # testes unitários (domínio e serviço)
│       └── integration/   # testes da API com PostgreSQL real
├── frontend/              # Next.js (App Router)
│   ├── app/               # página do CRUD
│   ├── lib/               # cliente da API e formatações
│   └── tests/
├── docs/                  # PR, passo a passo e evidências (prints)
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Regras de negócio

- **CPF** validado pelos dígitos verificadores (aceita com ou sem máscara) e armazenado só com dígitos; é a chave primária.
- **Nome** obrigatório, até 120 caracteres.
- **Data de nascimento** no formato `AAAA-MM-DD`, válida no calendário e não futura.
- **Idade** é calculada na leitura (anos completos, inclui tratamento de 29/02); não é gravada no banco.

## API

| Método | Rota            | Descrição                          | Respostas     |
| ------ | --------------- | ---------------------------------- | ------------- |
| POST   | `/pessoas`      | Cadastra pessoa                    | 201, 400, 409 |
| GET    | `/pessoas`      | Lista pessoas (ordem por nome)     | 200           |
| GET    | `/pessoas/:cpf` | Busca por CPF                      | 200, 400, 404 |
| PUT    | `/pessoas/:cpf` | Atualiza nome e data de nascimento | 200, 400, 404 |
| DELETE | `/pessoas/:cpf` | Remove pessoa                      | 204, 400, 404 |
| GET    | `/health`       | Verificação de saúde               | 200           |

Exemplo:

```bash
curl -X POST localhost:3001/pessoas -H 'Content-Type: application/json' \
  -d '{"cpf":"529.982.247-25","nome":"Ana Souza","dataNascimento":"1990-05-10"}'
# {"cpf":"52998224725","nome":"Ana Souza","dataNascimento":"1990-05-10","idade":36}
```

## Como executar

### Com Docker (recomendado)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- API: http://localhost:3001

### Localmente

Requer Node 22+ e um PostgreSQL acessível.

```bash
# banco (exemplo com Docker)
docker run -d --name pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crud_pessoas -p 5432:5432 postgres:16-alpine

# API
cd backend && cp .env.example .env && npm ci && npm start

# Frontend (em outro terminal)
cd frontend && cp .env.example .env.local && npm ci && npm run dev
```

## Testes e qualidade

```bash
# backend (os testes de integração precisam de um PostgreSQL; ajuste DATABASE_URL)
cd backend
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/crud_test
npm run lint            # análise estática (ESLint)
npm run format:check    # formatação (Prettier)
npm run test:unit       # testes unitários
npm run test:integration# testes de integração (API + PostgreSQL)
npm run test:coverage   # cobertura

# frontend
cd frontend
npm run lint && npm run format:check && npm test && npm run build
```

O banco de testes (`crud_test`) precisa existir. Exemplo:
`docker run -d -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=crud_test -p 5432:5432 postgres:16-alpine`.

## Metodologia (TDD) e Git

Cada funcionalidade segue o ciclo **RED → GREEN → REFACTOR**, com commits separados:

1. `test(...) [RED]` — testes escritos primeiro e falhando;
2. `feat(...) [GREEN]` — implementação mínima para passar;
3. `refactor(...)` — melhorias mantendo os testes verdes.

Convenção de commits: [Conventional Commits](https://www.conventionalcommits.org/).
O desenvolvimento ocorreu na branch `feature/crud-pessoa` e foi integrado à `main` via Pull Request
(descrição em [`docs/PULL_REQUEST.md`](docs/PULL_REQUEST.md)).

## Integração contínua

O workflow [`ci.yml`](.github/workflows/ci.yml) roda a cada push na `main` e em Pull Requests:
lint, formatação, testes unitários e de integração (com serviço PostgreSQL), build do frontend e build das imagens Docker.

## Imagens Docker

```bash
docker build -t atividade-ci-cd-workflow-api ./backend
docker build -t atividade-ci-cd-workflow-web ./frontend
docker images
```
