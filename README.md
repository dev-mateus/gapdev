
# GapDev

Uma plataforma de referência com três componentes principais: backend (FastAPI), um serviço auxiliar de IA e um frontend em React + Vite.

## Sumário

- **Sobre:** visão geral do projeto.
- **Estrutura:** pastas e arquivos principais.
- **Pré-requisitos:** software necessário.
- **Instalação & Execução:** passos para backend, ai-service e frontend.
- **Execução integrada:** rodar todos os serviços localmente.
- **Contribuição & Licença.**

## Sobre

Este repositório reúne um backend em Python (FastAPI), um micro-serviço de IA (agentes e prompts) e um frontend em React com Vite. Foi pensado para facilitar o desenvolvimento local e a integração entre serviços.

## Estrutura do repositório

- `backend/` — API, modelos, repositórios e serviços (FastAPI).
- `ai-service/` — agentes, prompts e cliente LLM (micro-serviço Python).
- `frontend/` — aplicação React + Vite.
- `prisma/` — esquema Prisma e migrations.
- `LICENSE` — licença do projeto.

Arquivos/folders relevantes:

- `backend/app/main.py`
- `ai-service/app/main.py`
- `frontend/package.json`

## Pré-requisitos

- Python 3.10+
- Node.js 18+ (ou 20+)
- npm ou yarn
- (Opcional) Docker

## Instalação e execução (local)

Siga as instruções por componente.

### Backend

1. Entre na pasta `backend`, crie e ative o ambiente:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

2. Configure variáveis de ambiente (ex.: `DATABASE_URL`, `SECRET_KEY`, `VITE_API_URL`).

3. Rode a aplicação em desenvolvimento:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API: `http://localhost:8000` — Docs: `http://localhost:8000/docs`.

### ai-service

O `ai-service` contém agentes e integrações com LLMs. Existem duas opções:

- Executar como FastMCP (se já houver entrypoint):

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m fastmcp app.main
```

- Ou adaptar para um pacote Python sem hífen (`ai_service`) e expor um entrypoint ASGI caso queira rodar via Uvicorn.

Configure chaves de provedores de LLM em `.env` (ex.: `OPENAI_API_KEY`).

### Frontend

1. Instale dependências e rode em dev:

```bash
cd frontend
npm ci
npm run dev
```

O Vite normalmente serve em `http://localhost:5173`.

## Executando tudo junto

Abra terminais separados e rode os serviços necessários:

- Backend: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- AI Service: execute conforme a opção escolhida (FastMCP ou ASGI)
- Frontend: `npm run dev` em `frontend`

## Desenvolvimento e contribuição

- Siga a arquitetura: models → repositories → services → routes.
- Adicione testes quando implementar novas features.
- Abra branches e PRs com descrições claras.

## Licença

Consulte o arquivo `LICENSE` na raiz do repositório.


