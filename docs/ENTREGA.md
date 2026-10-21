# Passos finais da entrega

O projeto foi desenvolvido e versionado localmente. Faltam as etapas que dependem do GitHub e do Docker.

## 1. Publicar no GitHub e abrir o Pull Request

Crie o repositório vazio `Atividade-CI-CD-Workflow` no GitHub (sem README, sem .gitignore) e, na pasta do projeto:

```bash
git remote add origin https://github.com/<SEU-USUARIO>/Atividade-CI-CD-Workflow.git
git push -u origin main                 # base do PR
git push -u origin feature/crud-pessoa  # branch com todo o desenvolvimento
```

Abra o PR pelo GitHub (botão "Compare & pull request") ou, com a GitHub CLI:

```bash
gh pr create --base main --head feature/crud-pessoa \
  --title "feat: CRUD de pessoas (CPF, nome, data de nascimento e idade) com TDD" \
  --body-file docs/PULL_REQUEST.md
```

Ao abrir o PR, o pipeline `CI` roda sozinho (aba **Actions**).

## 2. Criar a imagem Docker

```bash
docker build -t atividade-ci-cd-workflow-api ./backend
docker build -t atividade-ci-cd-workflow-web ./frontend
docker images
docker compose up --build   # sobe banco, API (3001) e frontend (3000)
```

## 3. Prints para completar o PDF

`docs/evidencias/Evidencias-Atividade-CI-CD-Workflow.pdf` já traz as etapas 1 a 14 (saídas reais dos comandos).
Faltam os prints das etapas 15 a 17 (build da imagem, aplicação rodando e GitHub/PR/Actions).
