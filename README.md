# GapDev - Setup do Projeto

Este guia mostra como criar os ambientes e instalar as dependencias do backend (Python) e frontend (React + Vite).

## Pre-requisitos

- Windows com PowerShell
- Python 3.10+ instalado
- Node.js 20+ instalado
- npm (vem com Node.js)

## 1) Backend (Python)

Abra um terminal na raiz do projeto e rode:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Observacao sobre `requirements.txt`

Se o arquivo foi gerado com `pip freeze > requirements.txt` no PowerShell 5, ele pode ficar em UTF-16 e causar erro no `pip install -r`.

Para recriar em UTF-8:

```powershell
pip freeze | Out-File -FilePath requirements.txt -Encoding utf8
```

Depois rode novamente:

```powershell
pip install -r requirements.txt
```

## 2) Frontend (React + Vite)

Em outro terminal, na raiz do projeto:

```powershell
cd frontend
npm ci
```

Para rodar em desenvolvimento:

```powershell
npm run dev
```

## 3) Como rodar tudo junto

Use dois terminais:

- Terminal 1: backend (com `.venv` ativado)
- Terminal 2: frontend com `npm run dev`

## Comandos uteis

Frontend:

```powershell
cd frontend
npm run build
npm run preview
npm run lint
```

Backend (com ambiente ativo):

```powershell
cd backend
pip freeze
```
