# Pull Request: CRUD de pessoas (CPF, nome, data de nascimento e idade)

**Branch:** `feature/crud-pessoa` → `main`

## Resumo

Implementa o CRUD de pessoas com cálculo de idade, seguindo TDD, com API Express + PostgreSQL e frontend Next.js,
além de análise estática, formatação, pipeline de CI e imagens Docker.

## O que mudou

- **Domínio:** validação de CPF (dígitos verificadores) e cálculo de idade (inclui 29/02 e datas inválidas/futuras).
- **Serviço:** regras do CRUD (criar, listar, buscar, atualizar, remover) com erros de validação, não encontrado e conflito.
- **API (Express):** rotas REST `/pessoas`, `/health`, tratamento centralizado de erros (400/404/409/500).
- **Banco (PostgreSQL):** repositório com `pg`, migração da tabela `pessoas`, CPF como chave primária.
- **Frontend (Next.js):** formulário com máscara de CPF, listagem com idade, edição e exclusão.
- **Qualidade:** ESLint + Prettier no backend e no frontend.
- **CI:** GitHub Actions (lint, formatação, testes unitários e de integração com PostgreSQL, build).
- **Docker:** Dockerfiles da API e do frontend + `docker-compose.yml`.

## Como foi testado

- Testes unitários (domínio e serviço) e de integração (API com PostgreSQL real) no backend: 72 testes, cobertura ≈ 96%.
- Testes unitários no frontend (máscara, formatação e cliente HTTP): 19 testes; `next build` sem erros.
- `eslint` e `prettier --check` sem pendências nos dois projetos.

## Checklist

- [x] Testes escritos antes da implementação (commits `[RED]` → `[GREEN]`)
- [x] Testes unitários passando
- [x] Testes de integração passando
- [x] Análise estática (ESLint) sem erros
- [x] Formatação (Prettier) aplicada
- [x] Pipeline de CI configurado
- [x] Dockerfiles e docker-compose
- [x] README atualizado
