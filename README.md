# GapDev

Plataforma que analisa descrições de vagas de emprego com IA, identifica as skills exigidas, compara com o perfil do desenvolvedor e gera um plano de estudos personalizado para fechar os gaps.

## Como funciona

```
Usuário cola a descrição de uma vaga
        ↓
IA analisa e identifica as skills exigidas
        ↓
Sistema compara com as skills do usuário
        ↓
Usuário vê sua compatibilidade com a vaga
        ↓
Sistema gera um plano de estudos para as skills que faltam
        ↓
Usuário acompanha o progresso no painel
```

## Tecnologias

### Backend
- **Python 3.13+** com **FastAPI**
- **SQLAlchemy** como ORM
- **PostgreSQL** em produção / **SQLite** em desenvolvimento
- **PyJWT** para autenticação via tokens JWT
- **Google OAuth** para login social

### AI Service
- **Modelo:** Qwen/Qwen2.5-7B-Instruct via Together AI
- **Infraestrutura:** HuggingFace Inference API (`InferenceClient`)
- **Token necessário:** `HF_TOKEN` (obtenha em https://huggingface.co/settings/tokens)
- **Agentes:** `analise_vaga.py` (extração de skills), `plano_estudo.py` (geração de plano)

### Frontend
- **React 19** + **TypeScript**
- **Vite** como bundler
- **TailwindCSS 4**
- **React Router 7**

## Estrutura do repositório

```
gapdev/
├── backend/                  # API REST (FastAPI)
│   ├── app/
│   │   ├── api/routes/       # Endpoints: auth, user, job, analise, study_plan...
│   │   ├── models/           # Modelos SQLAlchemy
│   │   ├── repositories/     # Acesso ao banco de dados
│   │   ├── services/         # Lógica de negócio
│   │   └── schemas/          # Schemas Pydantic
│   └── requirements.txt
├── ai_service/               # Micro-serviço de IA
│   ├── app/
│   │   ├── agents/           # analise_vaga.py, plano_estudo.py
│   │   ├── prompts/          # Templates de prompt
│   │   └── tools/            # llm_client.py (HuggingFace)
│   └── requirements.txt
└── frontend/                 # SPA React
    └── src/
        ├── app/              # Páginas
        ├── components/       # Componentes reutilizáveis
        ├── contexts/         # StudyPlanContext
        └── services/         # api.ts e serviços por domínio
```

## Variáveis de ambiente

### Backend (`backend/.env`)

```env
# Banco de dados
DATABASE_URL=sqlite:///./app.db
# Em produção (PostgreSQL):
# DATABASE_URL=postgresql+psycopg://user:password@host:5432/gapdev

# Segurança JWT — gere com: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=troque-esta-chave-em-producao

# Expiração do token em minutos (padrão: 1440 = 24h)
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### AI Service (`ai_service/.env`)

```env
# Token do HuggingFace — obtenha em: https://huggingface.co/settings/tokens
HF_TOKEN=hf_sua_chave_aqui
```

## Instalação e execução local

### Pré-requisitos

- Python 3.13+
- Node.js 20+
- npm

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crie o arquivo `backend/.env` com as variáveis acima e rode:

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API disponível em `http://localhost:8000`  
Documentação interativa em `http://localhost:8000/docs`

### 2. AI Service

```powershell
cd ai_service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crie o arquivo `ai_service/.env` com o `HF_TOKEN` e rode:

```powershell
python -m fastmcp run app/main.py --transport streamable-http --port 8001 --host 0.0.0.0
```

### 3. Frontend

```powershell
cd frontend
npm ci
npm run dev
```

Frontend disponível em `http://localhost:5173`

## Rodando tudo junto

Abra três terminais separados e rode um serviço em cada um:

```
Terminal 1 → backend:     uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
Terminal 2 → ai_service:  python -m fastmcp run app/main.py --transport streamable-http --port 8001
Terminal 3 → frontend:    npm run dev
```

## Endpoints principais da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/auth/login` | Login com email e senha |
| POST | `/auth/google` | Login com Google OAuth |
| GET | `/user` | Dados do usuário logado |
| GET | `/skills` | Skills do usuário |
| POST | `/skills` | Adicionar skill ao perfil |
| POST | `/jobs` | Criar vaga para análise |
| POST | `/analise` | Analisar descrição de vaga com IA |
| GET | `/study-plans` | Listar planos de estudos |
| GET | `/study-plans/{job_id}` | Plano de estudos de uma vaga |
| POST | `/study-plans` | Criar plano de estudos |
| PATCH | `/study-plans/items/{item_id}` | Atualizar status de tarefa |

## Padrão de desenvolvimento

A arquitetura do backend segue o fluxo:

```
models → repositories → services → routes
```

- `models/` — define as tabelas do banco (SQLAlchemy)
- `repositories/` — funções de acesso ao banco (queries)
- `services/` — lógica de negócio e validações
- `routes/` — endpoints HTTP (FastAPI)

Ao implementar uma nova feature, criar um arquivo em cada camada seguindo esse padrão.

## Contribuição

1. Crie uma branch a partir da `main`:
   ```bash
   git checkout -b minha-feature
   ```
2. Faça as alterações e commit com mensagem descritiva
3. Abra um Pull Request descrevendo o que foi feito
4. Aguarde revisão antes de mergear

## Licença

Consulte o arquivo `LICENSE` na raiz do repositório.