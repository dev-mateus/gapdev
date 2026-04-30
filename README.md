# GapDev

Este repositório contém um sistema dividido em três partes principais: um backend em Python, um serviço de IA separado (`ai-service`) e um frontend em React + Vite.

**Tech stack:** Python (FastAPI), Node + Vite (React), prompts/agents para automação de IA.

**Estrutura principal:**
- [backend](backend): API, modelos, repositórios e serviços (FastAPI).
- [ai-service](ai-service): serviço auxiliar com agentes e prompts para tarefas de IA.
- [frontend](frontend): aplicativo React + Vite.

**Arquivos importantes:**
- [backend/app/main.py](backend/app/main.py)
- [backend/app/api/routes](backend/app/api/routes)
- [ai-service/app/main.py](ai-service/app/main.py)
- [frontend/package.json](frontend/package.json)

## Pré-requisitos
- Python 3.10+ (recomendado)
- Node.js 18+ (ou 20+)
- npm ou yarn
- (Opcional) Docker se preferir conteinerizar

## Configuração e execução (local)

Siga as seções abaixo para preparar cada parte do projeto.

### Backend

1. Abra um terminal e entre na pasta `backend`:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

2. Variáveis de ambiente

Crie um arquivo `.env` em `backend/` (ou exporte as variáveis no seu ambiente). Exemplos comuns:

- `DATABASE_URL` — string de conexão do banco (ex: sqlite:///./dev.db ou postgres://...)
- `SECRET_KEY` — chave para criptografia/jwt
- `AI_API_KEY` — (se o backend usar um provedor externo de IA)

Consulte [backend/app/core/config.py](backend/app/core/config.py) para a implementação e outras chaves necessárias.

3. Rodar a aplicação (desenvolvimento):

```powershell
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API disponível em `http://localhost:8000` e documentação OpenAPI em `http://localhost:8000/docs`.

### ai-service

O `ai-service` é um micro-serviço Python separado que contém agentes, prompts e clientes LLM. Ele utiliza **FastMCP** (não é uma aplicação ASGI/FastAPI por padrão).

1. Entre na pasta e crie um ambiente:

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Variáveis de ambiente

Crie `.env` com chaves específicas de provedores de LLM (por exemplo `OPENAI_API_KEY`), se necessário.

3. Executando o serviço (FastMCP)

O `ai-service` não expõe atualmente um objeto ASGI `app` — por isso **não** use `uvicorn ai-service.app.main:app`. Além disso, o nome de pasta `ai-service` contém um hífen e não é um caminho de módulo Python válido.

Opções para executar o serviço:

- Execução via CLI do FastMCP (recomendado quando o módulo declara um `FastMCP` e chama `mcp.run()`):

```powershell
# a partir da pasta ai-service
python -m fastmcp app.main
# ou, se o comando estiver disponível no PATH:
fastmcp app.main
```

- Alternativa (importável por módulo): renomeie a pasta para `ai_service` e exponha um entrypoint. Exemplo de execução após renomear/ajustar:

```powershell
# se a pasta for renomeada para ai_service e o módulo exportar um FastMCP ou ASGI app
python -m ai_service.app.main
# ou, para ASGI (se implementar FastAPI/ASGI):
uvicorn ai_service.app.main:app --reload --port 8001
```

Observações:

- `ai-service/app/main.py` atualmente contém apenas uma docstring; para usar `python -m fastmcp app.main` o arquivo precisa declarar e executar um `FastMCP` (por exemplo `mcp = FastMCP(...); if __name__ == "__main__": mcp.run()`).
- Se sua intenção for servir via HTTP com Uvicorn/FastAPI, implemente e exporte um objeto ASGI `app` em `app/main.py` (ou converta `ai-service` para `ai_service`).

Se quiser, eu posso:
- ajustar o código em `ai-service` para expor um `FastMCP` entrypoint funcional; ou
- adicionar uma pequena aplicação FastAPI/ASGI em `ai-service` para permitir `uvicorn`.

### Frontend

1. Instale dependências:

```bash
cd frontend
npm ci
# ou: npm install
```

2. Rodar em desenvolvimento:

```bash
npm run dev
```

O frontend normalmente roda em `http://localhost:5173` (porta padrão do Vite).

### Executando tudo junto

Abra terminais separados e rode:

- Backend: `uvicorn backend.app.main:app --reload --port 8000`
- AI Service: `uvicorn ai-service.app.main:app --reload --port 8001` (opcional)
- Frontend: `npm run dev` em `frontend`

Se desejar, use `concurrently`, tmux ou scripts para orquestrar múltiplos processos.

## Endpoints principais

As rotas do backend ficam em [backend/app/api/routes](backend/app/api/routes).

Como os endpoints disponíveis dependem dos módulos efetivamente implementados e registrados na aplicação, consulte:

- os arquivos de rota realmente implementados em [backend/app/api/routes](backend/app/api/routes)
- a documentação interativa do FastAPI em `http://localhost:8000/docs`, com o backend em execução

## Desenvolvimento e contribuição

- Siga a arquitetura existente (models → repositories → services → routes).
- Adicione testes e atualize `requirements.txt` quando necessário.
- Para mudanças significativas, abra uma branch com nome descritivo e um PR.

## Dicas e notas

- Se `pip install -r requirements.txt` falhar por encodings, regrave o arquivo em UTF-8:

```powershell
pip freeze | Out-File -FilePath requirements.txt -Encoding utf8
```

- Se estiver usando Windows PowerShell, ative políticas de execução temporárias para ativar venvs:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\.venv\Scripts\Activate.ps1
```

## Licença

Veja o arquivo `LICENSE` na raiz do repositório.

