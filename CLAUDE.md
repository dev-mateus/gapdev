# CLAUDE.md

This file provides comprehensive guidance to Claude Code (claude.ai/code) when working with the GapDev codebase. It includes setup instructions, development workflows, architectural insights, and troubleshooting tips.

## 📋 Quick Reference

| Task | Command |
|------|---------|
| **Start Backend** | `cd backend && .\.venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` |
| **Start AI Service** | `cd ai_service && .\.venv\Scripts\Activate.ps1 && python -m fastmcp run app/main.py --transport streamable-http --port 8001 --host 0.0.0.0` |
| **Start Frontend** | `cd frontend && npm run dev` |
| **Run Frontend Tests** | `cd frontend && npm test` |
| **Lint Frontend** | `cd frontend && npm run lint` |
| **Build for Production** | `cd frontend && npm run build` |
| **Apply DB Migrations** | `cd backend && python -m prisma migrate deploy` |
| **Generate Prisma Client** | `cd backend && python -m prisma generate` |

## 🚀 Project Overview

GapDev is a platform that analyzes job descriptions with AI, identifies required skills, compares them with developer profiles, and generates personalized study plans to bridge skill gaps.

**Tech Stack:**
- **Backend**: Python 3.13+ • FastAPI • SQLAlchemy/Prisma • PostgreSQL (dev: SQLite) • PyJWT
- **AI Service**: Python • FastMCP • HuggingFace Inference API (Qwen/Qwen2.5-7B-Instruct)
- **Frontend**: React 19 • TypeScript • Vite • TailwindCSS 4 • React Router 7

## 🔧 Development Environment Setup

### Prerequisites
- Python 3.13+ (verified with `python --version`)
- Node.js 20+ (verified with `node --version`)
- npm (comes with Node.js)
- Git

### 1. Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Copy environment template (if .env doesn't exist)
if not exist .env copy ..\README.md .env  # Then manually copy the backend .env section from README
# OR manually create .env with:
# DATABASE_URL=sqlite:///./app.db
# SECRET_KEY=your-secret-key-here (generate with: python -c "import secrets; print(secrets.token_hex(32))")
# ACCESS_TOKEN_EXPIRE_MINUTES=1440

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
**Verification:** Visit http://localhost:8000/docs to see the interactive API documentation.

### 2. AI Service Setup
```powershell
cd ai_service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

# Create .env file with your HuggingFace token
# Get token from: https://huggingface.co/settings/tokens
# Contents: HF_TOKEN=hf_your_token_here

python -m fastmcp run app/main.py --transport streamable-http --port 8001 --host 0.0.0.0
```
**Verification:** The service should start without errors and be accessible at http://localhost:8001.

### 3. Frontend Setup
```powershell
cd frontend
npm ci  # or npm install
npm run dev  # starts Vite dev server
```
**Verification:** Visit http://localhost:5173 to see the running application.

### 4. Running All Services Together
For full-stack development, open three separate terminals:
1. Terminal 1: Backend (port 8000)
2. Terminal 2: AI Service (port 8001) 
3. Terminal 3: Frontend (port 5173)

## 🏗️ Architecture Details

### Backend Structure (`backend/app/`)
Follows a clean layered architecture:
```
models/        → SQLAlchemy models (database tables)
               ├── user.py          # User authentication & profile
               ├── job.py           # Job postings
               ├── skill.py         # Skills catalog
               ├── user_skill.py    # User-skill relationships
               ├── study_plan.py    # Study plans & items
               ├── analise.py       # Job analysis results
               └── enums.py         # Enums (JobLevel, etc.)

repositories/  → Data access layer (queries)
               ├── user_repo.py
               ├── job_repository.py
               ├── skill_repository.py
               ├── user_skill_repository.py
               ├── study_plan_repository.py
               └── analise_repository.py

services/      → Business logic & validation
               ├── user_service.py
               ├── job_service.py
               ├── user_skill_service.py
               ├── study_plan_service.py
               └─ analise_service.py    # Orchestrates AI service calls

routes/        → FastAPI endpoint definitions
               ├── auth.py          # Login, registration, Google OAuth
               ├── user.py          # Profile management
               ├── job.py           # Job CRUD operations
               ├── user_skill.py    # Skills management
               ├── study_plan.py    # Study plan CRUD
               └── analise.py       # Job analysis endpoints

schemas/       → Pydantic models for validation
               ├── user.py
               ├── job.py
               ├── study_plan.py
               └── analise.py

core/          → Cross-cutting concerns
├── config.py     # Environment variables & settings
├── security.py   # Password hashing, JWT handling
└── deps.py       # Dependency injection (DB sessions, auth)

db/            → Database utilities
├── session.py    # SQLAlchemy engine & session factory
├── base.py       # Base model class
├── seed_skills.py # Initial skills database population
└── prisma_client.py # Prisma client wrapper (alternative to SQLAlchemy)
```

**Adding a New Feature (e.g., "Notifications"):**
1. Create `models/notification.py`
2. Create `repositories/notification_repo.py`
3. Create `services/notification_service.py`
4. Create `routes/notification.py`
5. Create `schemas/notification.py`
6. Register router in `main.py`
7. Run migrations: `python -m prisma migrate dev --name add_notifications`

### AI Service Structure (`ai_service/app/`)
Microservice exposing HuggingFace model capabilities:
```
agents/        → AI agents (single responsibility)
├── analise_vaga.py      # Extracts skills from job descriptions
│   ├── Uses HuggingFace model via llm_client
│   ├── Parses response into structured skills
│   └── Returns canonical skills from catalog
└── plano_estudo.py      # Generates study plans
    ├── Compares job skills vs user skills
    ├── Creates learning roadmap
    └── Returns structured study plan

prompts/       → Prompt templates for LLM
├── analise_vaga.jinja2  # Template for job analysis
└── plano_estudo.jinja2  # Template for study plan generation

tools/         → LLM interaction layer
└── llm_client.py        # Wrapper around HuggingFace Inference API
    ├── Handles authentication (HF_TOKEN)
    ├── Manages retries & error handling
    └── Provides async inference methods
```

**Adding a New AI Capability:**
1. Create new agent in `agents/` (e.g., `entrevista_prep.py`)
2. Add corresponding prompt template in `prompts/`
3. Update `llm_client.py` if new parameters needed
4. Export function in `app/__init__.py` or create new router
5. Update backend service to call new endpoint

### Frontend Structure (`frontend/src/`)
Feature-based organization with React 19:
```
app/             → Page components (route-level)
├── (routes)/    # Route groups (authenticated/public)
│   ├── layout.tsx     # Shared layout
│   ├── login/         # Login page
│   ├── cadastro/      # Registration page
│   ├── vagas/         # Job listing & creation
│   ├── plano-estudos/ # Study plans dashboard
│   ├── resultado-analise/ # Analysis results
│   ├── historico-vagas/ # Applied jobs history
│   ├── perfil/        # User profile
│   └── compatibilidade/ # Skill gap analysis

components/      → Reusable UI components (atoms/molecules)
├── Button/          # Button variants (primary, secondary, etc.)
├── Input/           # Form inputs with validation
├── TextArea/        # Textarea component
├── SkillCard/       # Individual skill display
├── SkillSelectableCard/ # Skill selection component
├── CompatibilityCard/ # Match visualization
├── WeeklyStudyPlan/ # Study plan visualization
├── Sidebar/         # Navigation sidebar
├── PageHeader/      # Page titles & actions
├── SectionCard/     # Card container component
└── LoadingState/    # Loading spinners/skeletons

contexts/        → React state management
└── StudyPlanContext.tsx  # Global study plan state

services/        → API communication layer
├── api.ts           # Base HTTP client (axios instance)
├── authService.ts   # Auth endpoints wrapper
├── jobService.ts    # Job-related API calls
├── studyPlanService.ts # Study plan endpoints
└── compatService.ts # Compatibility analysis endpoints

utils/           → Utility functions & helpers
├── validators.ts    # Form validation logic
└── jobLevel.ts      # Job level hierarchy utilities

styles/          → Global styling
├─ global.css        # Base styles & CSS resets
└─ [component].module.css # Component-scoped CSS (via Tailwind)
```

**Adding a New Feature:**
1. Create route folder in `app/(routes)/` (e.g., `notificacoes/`)
2. Add `page.tsx` for the page component
3. Create any needed reusable components in `components/`
4. Add service functions in `services/` if new API endpoints needed
5. Update route configuration if needed (using React Router 7 file-based routing)
6. Add types in relevant `types.ts` files if needed

## 🔄 Development Workflows

### Backend Development Cycle
1. **Create/Update Model** (`backend/app/models/`)
   - Define SQLAlchemy model with fields & relationships
   - Add to `__init__.py` if new model
2. **Update Repository** (`backend/app/repositories/`)
   - Implement CRUD operations using SQLAlchemy
   - Follow existing patterns (e.g., `job_repository.py`)
3. **Implement Service Logic** (`backend/app/services/`)
   - Add business rules, validation, data transformation
   - Call repository methods for data access
4. **Create API Endpoints** (`backend/app/routes/`)
   - Define FastAPI routes with proper status codes
   - Use Pydantic schemas for request/response validation
   - Handle errors with HTTPException
5. **Update Database Schema**
   - Modify `backend/prisma/schema.prisma` 
   - Generate migration: `python -m prisma migrate dev --name "descriptive_name"`
   - Apply migration: `python -m prisma migrate deploy`
6. **Test Endpoints**
   - Visit http://localhost:8000/docs for interactive testing
   - Or use curl/Postman for automated testing

### Frontend Development Cycle
1. **Create Page Component** (`frontend/src/app/(routes)/feature/page.tsx`)
   - Use React 19 function components with hooks
   - Implement data fetching via service functions
   - Handle loading/error states
2. **Add Reusable Components** (`frontend/src/components/`)
   - Create atomic components (buttons, inputs, etc.)
   - Use TailwindCSS for styling
   - Create component-specific CSS modules when needed
3. **Update Service Layer** (`frontend/src/services/`)
   - Add new API functions in relevant service file
   - Use the base `api.ts` client for consistency
   - Handle request/response transformation
4. **Manage State** (if needed)
   - Use React Context for global state (see StudyPlanContext)
   - Use useState/useReducer for local component state
   - Consider URL state for shareable filters/sorts
5. **Style with Tailwind**
   - Use utility classes directly in JSX
   - Create reusable classes in `@apply` directives if needed
   - Refer to `tailwind.config.js` via `postcss.config.js` (inherited from Vite)

### AI Service Development
1. **Create Prompt Template** (`ai_service/app/prompts/`)
   - Use Jinja2 templating for dynamic prompts
   - Include clear instructions and output format specifications
   - Test with sample inputs in HuggingFace playground
2. **Implement Agent Logic** (`ai_service/app/agents/`)
   - Parse input parameters
   - Format prompt using template
   - Call LLM via `llm_client`
   - Parse and validate response
   - Return structured data matching expected schema
3. **Update LLM Client** (if needed) (`ai_service/app/tools/llm_client.py`)
   - Add new inference parameters
   - Handle different model versions
   - Implement caching or batching if beneficial
4. **Test Integration**
   - Run service locally: `python -m fastmcp run app/main.py ...`
   - Test endpoint directly with curl or HTTP client
   - Verify backend service integration

## 🧪 Testing & Quality Assurance

### Frontend Testing
- **Framework**: Vitest + React Testing Library
- **Configuration**: See `frontend/vite.config.ts` (test section)
- **Example**: `frontend/src/test/resultado-analise.test.tsx`
- **Run Tests**: `cd frontend && npm test`
- **Watch Mode**: `cd frontend && npx vitest --watch`
- **Coverage**: `cd frontend && npm run test -- --coverage`

**Testing Patterns to Follow:**
- Test component rendering with various props
- Mock API calls using `vi.mock()` 
- Test user interactions (clicks, form inputs)
- Verify state updates and side effects
- Test error handling and loading states

### Backend Testing
*Note: Currently minimal formal test coverage. Recommended approach:*
- Use `pytest` for unit/testing (add to `requirements.txt` if needed)
- Test service layer functions in isolation
- Use TestClient for endpoint integration tests
- Mock external services (AI service, email) in tests

**To add testing capability:**
```powershell
cd backend
pip install pytest pytest-asyncio httpx
# Then create tests/backend/ directory with test files
```

### Code Quality & Linting
**Frontend:**
- **Linting**: ESLint + Plugin React (`npm run lint`)
- **Formatting**: Prettier (configured via VSCode settings or precommit hooks)
- **Type Checking**: TypeScript (`tsc --noEmit` or IDE integration)

**Backend:**
- **Linting**: Flake8 or Ruff (consider adding to requirements)
- **Formatting**: Black (consider adding to requirements)
- **Type Checking**: MyPy or PyRight (consider adding to requirements)

**Pre-commit hooks** (recommended for consistency):
```powershell
# Install pre-commit
pip install pre-commit
# Create .pre-commit-config.yaml with:
#   - repo: https://github.com/psf/black
#     rev: stable
#     hooks: [ { id: black } ]
#   - repo: https://github.com/charliermarsh/ruff-pre-commit
#     rev: v0.1.0
#     hooks: [ { id: ruff } ]
#   - repo: https://github.com/pre-commit/mirrors-mypy
#     rev: v0.9.10
#     hooks: [ { id: mypy } ]
# Run: pre-commit install
```

## 🐛 Troubleshooting Guide

### Common Backend Issues
**"Module not found" errors**
- Solution: Ensure virtual environment is activated (`.\.venv\Scripts\Activate.ps1`)
- Check: `where python` should point to venv's python.exe

**Database connection errors**
- Solution: Verify `.env` file has correct `DATABASE_URL`
- For SQLite: Ensure `app.db` file exists in backend root
- For PostgreSQL: Confirm service is running and credentials are correct

**Prisma migration issues**
- Solution: Delete `migrations` folder and `dev.db` (if SQLite), then:
  ```powershell
  python -m prisma migrate dev --name init
  python -m prisma generate
  ```

**Port already in use**
- Solution: Change port in uvicorn command or free the port:
  ```powershell
  netstat -ano | findstr :8000
  taskkill /PID <PID> /F
  ```

### Common Frontend Issues
**"Module not found" errors**
- Solution: Run `npm ci` to reinstall exact dependencies
- Check: Node version compatibility (use nvm if needed)

**HMR not working**
- Solution: Restart dev server (`npm run dev`)
- Check: File watchers not exhausted (increase system limits if needed)

**CSS/Tailwind not applying**
- Solution: Verify `@tailwindcss/vite` plugin in `vite.config.ts`
- Check: Template paths in tailwind.config.js (if customized)

### Common AI Service Issues
**"HF_TOKEN not set" errors**
- Solution: Create `.env` file with `HF_TOKEN=your_token_here`
- Get token from: https://huggingface.co/settings/tokens

**Model loading failures**
- Solution: Check internet connectivity (model loads from HuggingFace Hub)
- Verify: Correct model name in `llm_client.py`
- Consider: Adding retry logic for rate limits

**Slow response times**
- Solution: Check HuggingFace API status
- Consider: Implementing response caching for repeated requests
- Monitor: Token usage and rate limits

## 📚 Directory-Specific Guidelines

### When Modifying backend/app/models/
- Add docstrings to all classes and methods
- Follow SQLAlchemy 2.0 typing conventions
- Define relationships with `back_populates` and proper cascades
- Add `__tablename__` attribute explicitly
- Use appropriate field types (String length, Integer, Boolean, etc.)

### When Modifying backend/app/services/
- Keep business logic separate from data access
- Raise appropriate HTTP exceptions (400, 404, etc.) for business rule violations
- Validate inputs early in public methods
- Write pure functions where possible for easier testing
- Document complex algorithms with comments

### When Modifying frontend/src/components/
- Create reusable, presentational components
- Accept all data/configuration via props
- Use TypeScript interfaces for prop validation
- Handle edge cases (empty states, loading, errors)
- Follow existing styling patterns (Tailwind classes)
- Export as named exports from barrel files when appropriate

### When Modifying frontend/src/app/(routes)/
- Use file-based routing (React Router 7 conventions)
- Implement proper loading and error states
- Use URL state for shareable filters/sorts when applicable
- Implement proper error boundaries if needed
- Optimize re-renders with useMemo/useCallback where beneficial

### When Modifying ai_service/agents/
- Keep agents focused on single responsibility
- Handle all error cases from LLM API (timeouts, rate limits, invalid responses)
- Validate and sanitize inputs before prompting
- Parse and validate LLM outputs against expected schemas
- Log errors appropriately for debugging
- Consider adding caching for repeated identical requests

## 📖 Additional Resources

- **API Documentation**: http://localhost:8000/docs (when backend running)
- **AI Service Docs**: http://localhost:8001/docs (when AI service running)
- **Frontend Docs**: Check `frontend/README.md` if exists
- **Database Schema**: `backend/prisma/schema.prisma`
- **API Contracts**: OpenAPI specs generated by FastAPI
- **Component Library**: Refer to existing components in `frontend/src/components/`

## 🔄 Contributing Guidelines

1. **Branch Strategy**: 
   - `main` → protected production branch
   - Create feature branches from `main`: `git checkout -b feature/your-feature-name`
   - Use descriptive commit messages in imperative mood

2. **Pull Request Process**:
   - Ensure code passes linters and tests
   - Update documentation if needed
   - Request review from team members
   - Squash and merge upon approval

3. **Coding Standards**:
   - Follow existing code style in each language/framework
   - Write self-documenting code with clear variable/function names
   - Add comments for complex logic or non-obvious decisions
   - Keep functions focused and reasonably sized

4. **Testing**:
   - Write tests for new functionality when possible
   - Maintain or improve existing test coverage
   - Bug fixes should include regression tests

5. **Documentation**:
   - Update README.md if user-facing changes
   - Add inline comments for complex implementations
   - Consider adding JSDoc/docstrings for public APIs

## ⚠️ Important Notes

**Environment Variables**: Never commit `.env` files. Use the examples in README.md as templates.

**Database Migrations**: 
- Always test migrations on a copy of production data first
- Backup data before running destructive migrations
- Run `python -m prisma generate` after changing Prisma schema

**AI Service Usage**:
- Monitor HuggingFace API usage and costs
- Implement caching for repeated identical requests
- Handle rate limiting gracefully in client code

**Frontend Performance**:
- Lazy-load routes when appropriate using React.lazy()
- Memoize expensive computations with useMemo()
- Virtualize long lists if performance becomes an issue
- Optimize images and assets

**Security**:
- Never hardcode secrets in source code
- Validate all inputs on both client and server
- Implement proper CORS policies (already configured in backend)
- Use HTTPS in production (configure reverse proxy)

This CLAUDE.md file should be treated as a living document. As the project evolves, update it to reflect new patterns, tools, and best practices discovered during development.