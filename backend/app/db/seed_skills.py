"""Seed data for the canonical skills catalog."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.models.skill_alias import SkillAlias
from app.repositories.job_skill_repository import get_or_create_skill, get_skill_by_slug, normalize_skill_alias_key

DEFAULT_SKILL_CATALOG: list[dict[str, object]] = [
    {"canonical_name": "JavaScript", "description": "Linguagem de programação para web", "category": "Linguagens"},
    {"canonical_name": "TypeScript", "description": "Superset tipado de JavaScript", "category": "Linguagens"},
    {"canonical_name": "Python", "description": "Linguagem versátil para backend e IA", "category": "Linguagens"},
    {"canonical_name": "Java", "description": "Linguagem orientada a objetos multiplataforma", "category": "Linguagens"},
    {"canonical_name": "C#", "slug": "csharp", "description": "Linguagem moderna para ecossistema .NET", "category": "Linguagens"},
    {"canonical_name": "Go", "description": "Linguagem performática para serviços concorrentes", "category": "Linguagens"},
    {"canonical_name": "Rust", "description": "Linguagem focada em segurança de memória", "category": "Linguagens"},
    {"canonical_name": "Kotlin", "description": "Linguagem moderna para Android e backend", "category": "Linguagens"},
    {"canonical_name": "Swift", "description": "Linguagem para desenvolvimento iOS e macOS", "category": "Linguagens"},
    {"canonical_name": "PHP", "description": "Linguagem amplamente usada para web", "category": "Linguagens"},
    {"canonical_name": "SQL", "description": "Linguagem de consulta para bancos relacionais", "category": "Linguagens"},
    {"canonical_name": "React", "description": "Biblioteca JavaScript para interfaces", "category": "Frontend"},
    {"canonical_name": "Next.js", "description": "Framework React para aplicações web", "category": "Frontend"},
    {"canonical_name": "Vue.js", "description": "Framework progressivo para interfaces web", "category": "Frontend"},
    {"canonical_name": "Angular", "description": "Framework frontend completo para SPAs", "category": "Frontend"},
    {"canonical_name": "Svelte", "description": "Framework compilado para interfaces reativas", "category": "Frontend"},
    {"canonical_name": "Tailwind CSS", "description": "Framework utilitário de estilos CSS", "category": "Frontend"},
    {"canonical_name": "Bootstrap", "description": "Framework CSS para interfaces responsivas", "category": "Frontend"},
    {"canonical_name": "Sass", "description": "Pré-processador CSS com recursos avançados", "category": "Frontend"},
    {"canonical_name": "Storybook", "description": "Documentação e desenvolvimento de componentes UI", "category": "Frontend"},
    {"canonical_name": "Node.js", "description": "Runtime JavaScript para backend", "category": "Backend"},
    {"canonical_name": "Express.js", "description": "Framework minimalista para APIs Node.js", "category": "Backend"},
    {"canonical_name": "FastAPI", "description": "Framework Python para APIs", "category": "Backend"},
    {"canonical_name": "Django", "description": "Framework Python completo para aplicações web", "category": "Backend"},
    {"canonical_name": "Flask", "description": "Microframework Python para serviços web", "category": "Backend"},
    {"canonical_name": "Spring Boot", "description": "Framework Java para microsserviços e APIs", "category": "Backend"},
    {"canonical_name": ".NET", "slug": "dotnet", "description": "Plataforma para aplicações enterprise", "category": "Backend"},
    {"canonical_name": "NestJS", "description": "Framework Node.js estruturado e escalável", "category": "Backend"},
    {"canonical_name": "React Native", "description": "Framework mobile multiplataforma", "category": "Mobile"},
    {"canonical_name": "Flutter", "description": "Framework para aplicativos móveis", "category": "Mobile"},
    {"canonical_name": "Android", "description": "Desenvolvimento nativo para dispositivos Android", "category": "Mobile"},
    {"canonical_name": "iOS", "description": "Desenvolvimento nativo para dispositivos Apple", "category": "Mobile"},
    {"canonical_name": "PostgreSQL", "description": "Banco de dados relacional", "category": "Banco de Dados"},
    {"canonical_name": "MongoDB", "description": "Banco de dados NoSQL", "category": "Banco de Dados"},
    {"canonical_name": "MySQL", "description": "Banco de dados relacional amplamente utilizado", "category": "Banco de Dados"},
    {"canonical_name": "MariaDB", "description": "Banco de dados relacional compatível com MySQL", "category": "Banco de Dados"},
    {"canonical_name": "SQLite", "description": "Banco de dados embarcado e leve", "category": "Banco de Dados"},
    {"canonical_name": "Redis", "description": "Banco em memória para cache e mensageria", "category": "Banco de Dados"},
    {"canonical_name": "Firebase", "description": "Plataforma backend com serviços gerenciados", "category": "Banco de Dados"},
    {"canonical_name": "Elasticsearch", "description": "Mecanismo de busca e análise distribuída", "category": "Banco de Dados"},
    {"canonical_name": "Docker", "description": "Ferramenta de containers", "category": "DevOps & Cloud"},
    {"canonical_name": "Kubernetes", "description": "Orquestração de containers em escala", "category": "DevOps & Cloud"},
    {"canonical_name": "Terraform", "description": "Infraestrutura como código declarativa", "category": "DevOps & Cloud"},
    {"canonical_name": "Ansible", "description": "Automação de configuração e provisionamento", "category": "DevOps & Cloud"},
    {"canonical_name": "Jenkins", "description": "Servidor de integração contínua", "category": "DevOps & Cloud"},
    {"canonical_name": "GitLab CI", "description": "Pipelines de CI/CD no GitLab", "category": "DevOps & Cloud"},
    {"canonical_name": "Nginx", "description": "Servidor web e proxy reverso", "category": "DevOps & Cloud"},
    {"canonical_name": "Linux", "description": "Sistema operacional para servidores e automação", "category": "DevOps & Cloud"},
    {"canonical_name": "AWS", "description": "Serviços em nuvem", "category": "DevOps & Cloud"},
    {"canonical_name": "Azure", "description": "Plataforma de nuvem da Microsoft", "category": "DevOps & Cloud"},
    {"canonical_name": "Google Cloud Platform", "description": "Plataforma de nuvem do Google", "category": "DevOps & Cloud"},
    {"canonical_name": "Postman", "description": "Teste e documentação de APIs", "category": "Ferramentas"},
    {"canonical_name": "Insomnia", "description": "Cliente para APIs REST", "category": "Ferramentas"},
    {"canonical_name": "Swagger/OpenAPI", "description": "Especificação e documentação de APIs", "category": "Ferramentas"},
    {"canonical_name": "Jira", "description": "Gestão de tarefas e projetos ágeis", "category": "Ferramentas"},
    {"canonical_name": "Jest", "description": "Framework de testes JavaScript", "category": "Testes"},
    {"canonical_name": "Cypress", "description": "Testes end-to-end", "category": "Testes"},
    {"canonical_name": "Pytest", "description": "Framework de testes para Python", "category": "Testes"},
    {"canonical_name": "Playwright", "description": "Automação cross-browser para testes E2E", "category": "Testes"},
    {"canonical_name": "Selenium", "description": "Automação de navegadores para testes", "category": "Testes"},
    {"canonical_name": "Vitest", "description": "Framework de testes rápido para Vite", "category": "Testes"},
    {"canonical_name": "Figma", "description": "Design de interfaces", "category": "UI/UX"},
    {"canonical_name": "Adobe XD", "description": "Prototipação e design de interfaces digitais", "category": "UI/UX"},
    {"canonical_name": "Design System", "description": "Sistema visual reutilizável", "category": "UI/UX"},
    {"canonical_name": "Machine Learning", "description": "Modelos inteligentes e preditivos", "category": "IA"},
    {"canonical_name": "TensorFlow", "description": "Framework para IA", "category": "IA"},
    {"canonical_name": "PyTorch", "description": "Framework para deep learning e pesquisa em IA", "category": "IA"},
    {"canonical_name": "LangChain", "description": "Orquestração de aplicações com LLMs", "category": "IA"},
    {"canonical_name": "OpenAI API", "description": "Integração de modelos de linguagem e multimodais", "category": "IA"},
    {"canonical_name": "NLP", "description": "Processamento de linguagem natural", "category": "IA"},
    {"canonical_name": "Computer Vision", "description": "Técnicas de visão computacional", "category": "IA"},
    {"canonical_name": "JWT", "description": "Autenticação baseada em tokens", "category": "Cibersegurança"},
    {"canonical_name": "OAuth", "description": "Autorização segura", "category": "Cibersegurança"},
    {"canonical_name": "OWASP", "description": "Boas práticas para segurança de aplicações web", "category": "Cibersegurança"},
    {"canonical_name": "Keycloak", "description": "Gestão de identidade e acesso", "category": "Cibersegurança"},
    {"canonical_name": "Pandas", "description": "Manipulação de dados em Python", "category": "Dados"},
    {"canonical_name": "NumPy", "description": "Computação numérica e estruturas de arrays", "category": "Dados"},
    {"canonical_name": "Apache Spark", "description": "Processamento distribuído de dados em grande escala", "category": "Dados"},
    {"canonical_name": "dbt", "description": "Transformação de dados em data warehouses", "category": "Dados"},
    {"canonical_name": "Tableau", "description": "Business intelligence e visualização analítica", "category": "Dados"},
    {"canonical_name": "Power BI", "description": "Visualização de dados", "category": "Dados"},
    {"canonical_name": "Apache Kafka", "description": "Plataforma distribuída de streaming de eventos", "category": "Dados"},
    {"canonical_name": "RabbitMQ", "description": "Broker de mensageria baseado em filas", "category": "Dados"},
    {"canonical_name": "Unity", "description": "Engine para jogos", "category": "Game Dev"},
    {"canonical_name": "Godot", "description": "Engine open-source para desenvolvimento de jogos", "category": "Game Dev"},
    {"canonical_name": "Unreal Engine", "description": "Engine gráfica para jogos", "category": "Game Dev"},
    {"canonical_name": "Bubble", "description": "Plataforma low code", "category": "Low Code"},
    {"canonical_name": "FlutterFlow", "description": "Construção visual de apps", "category": "Low Code"},
    {"canonical_name": "REST", "description": "Arquitetura para APIs", "category": "APIs"},
    {"canonical_name": "GraphQL", "description": "Linguagem de consulta para APIs", "category": "APIs"},
    {"canonical_name": "gRPC", "description": "Framework de RPC de alta performance", "category": "APIs"},
    {"canonical_name": "WebSockets", "description": "Comunicação bidirecional em tempo real", "category": "APIs"},
    {"canonical_name": "WordPress", "description": "CMS para sites", "category": "CMS"},
    {"canonical_name": "Strapi", "description": "CMS Headless", "category": "CMS"},
    {"canonical_name": "Contentful", "description": "CMS headless SaaS para conteúdo estruturado", "category": "CMS"},
    {"canonical_name": "Sanity", "description": "CMS headless com conteúdo em tempo real", "category": "CMS"},
    {"canonical_name": "Git", "description": "Controle de versão", "category": "Versionamento"},
    {"canonical_name": "GitHub", "description": "Hospedagem de repositórios", "category": "Versionamento"},
    {"canonical_name": "GitLab", "description": "Hospedagem e colaboração de repositórios Git", "category": "Versionamento"},
    {"canonical_name": "Bitbucket", "description": "Plataforma de repositórios Git para equipes", "category": "Versionamento"},
    {"canonical_name": "Clean Architecture", "description": "Arquitetura escalável de software", "category": "Arquitetura"},
    {"canonical_name": "Microservices", "description": "Arquitetura distribuída", "category": "Arquitetura"},
    {"canonical_name": "Domain-Driven Design", "description": "Modelagem de software guiada pelo domínio", "category": "Arquitetura"},
    {"canonical_name": "Event-Driven Architecture", "description": "Arquitetura orientada a eventos", "category": "Arquitetura"},
    {"canonical_name": "SOLID", "description": "Princípios de design orientado a objetos", "category": "Arquitetura"},
    {"canonical_name": "Prometheus", "description": "Coleta e armazenamento de métricas", "category": "Observabilidade"},
    {"canonical_name": "Grafana", "description": "Visualização de métricas e dashboards", "category": "Observabilidade"},
    {"canonical_name": "Kibana", "description": "Visualização e exploração de logs e eventos", "category": "Observabilidade"},
]

DEFAULT_SKILL_ALIASES: list[dict[str, str]] = [
    {"skill_slug": "javascript", "alias": "JS"},
    {"skill_slug": "javascript", "alias": "Java Script"},
    {"skill_slug": "javascript", "alias": "ECMAScript"},
    {"skill_slug": "typescript", "alias": "TS"},
    {"skill_slug": "typescript", "alias": "Type Script"},
    {"skill_slug": "react", "alias": "React.js"},
    {"skill_slug": "next-js", "alias": "Next"},
    {"skill_slug": "node-js", "alias": "Node"},
    {"skill_slug": "node-js", "alias": "Node.js"},
    {"skill_slug": "express-js", "alias": "Express"},
    {"skill_slug": "express-js", "alias": "Express.js"},
    {"skill_slug": "csharp", "alias": "C#"},
    {"skill_slug": "csharp", "alias": "C Sharp"},
    {"skill_slug": "dotnet", "alias": ".NET"},
    {"skill_slug": "dotnet", "alias": "Dot Net"},
    {"skill_slug": "postgresql", "alias": "Postgres"},
    {"skill_slug": "postgresql", "alias": "Postgre"},
    {"skill_slug": "mongodb", "alias": "Mongo"},
    {"skill_slug": "machine-learning", "alias": "ML"},
    {"skill_slug": "jwt", "alias": "JSON Web Token"},
    {"skill_slug": "oauth", "alias": "OAuth2"},
    {"skill_slug": "cicd", "alias": "CI/CD"},
    {"skill_slug": "cicd", "alias": "CICD"},
    {"skill_slug": "cicd", "alias": "Continuous Integration"},
    {"skill_slug": "cicd", "alias": "Continuous Delivery"},
    {"skill_slug": "rest", "alias": "REST API"},
    {"skill_slug": "rest", "alias": "API REST"},
    {"skill_slug": "graphql", "alias": "GraphQL API"},
    {"skill_slug": "power-bi", "alias": "PowerBI"},
    {"skill_slug": "power-bi", "alias": "Power BI"},
    {"skill_slug": "websockets", "alias": "WebSocket"},
    {"skill_slug": "swagger-openapi", "alias": "OpenAPI"},
    {"skill_slug": "swagger-openapi", "alias": "Swagger"},
    {"skill_slug": "tailwind-css", "alias": "Tailwind"},
    {"skill_slug": "tailwind-css", "alias": "TailwindCSS"},
]


def _ensure_skill(db: Session, item: dict[str, object]) -> tuple[Skill, bool]:
    """Create or update a canonical skill record from the seed catalog."""

    canonical_name = str(item["canonical_name"])
    slug = str(item.get("slug") or "").strip() or None
    skill = get_skill_by_slug(db, slug) if slug else None
    if not skill:
        skill = get_or_create_skill(db, canonical_name)

    should_commit = False
    if skill.canonical_name != canonical_name:
        skill.canonical_name = canonical_name
        should_commit = True

    if slug and skill.slug != slug:
        skill.slug = slug
        should_commit = True

    category = item.get("category")
    if isinstance(category, str) and skill.category != category:
        skill.category = category
        should_commit = True

    description = item.get("description")
    if isinstance(description, str) and skill.description != description:
        skill.description = description
        should_commit = True

    if not skill.active:
        skill.active = True
        should_commit = True

    if should_commit:
        db.commit()
        db.refresh(skill)

    return skill, should_commit


def _upsert_skill_alias(db: Session, skill: Skill, alias: str) -> bool:
    """Insert or update a normalized alias for a canonical skill."""

    normalized_alias = normalize_skill_alias_key(alias)
    if not normalized_alias:
        return False

    statement = select(SkillAlias).where(SkillAlias.normalized_alias == normalized_alias)
    existing_alias = db.scalars(statement).first()
    if existing_alias:
        if existing_alias.skill_id != skill.id or existing_alias.alias != alias:
            existing_alias.skill_id = skill.id
            existing_alias.alias = alias
            return True
        return False

    db.add(SkillAlias(skill_id=str(skill.id), alias=alias, normalized_alias=normalized_alias))
    return True


def seed_skills_catalog(db: Session) -> int:
    """Ensure the default skill catalog exists and is synchronized."""

    changed = 0
    seen_alias_keys: set[str] = set()

    for item in DEFAULT_SKILL_CATALOG:
        _, skill_changed = _ensure_skill(db, item)
        if skill_changed:
            changed += 1

    for alias_item in DEFAULT_SKILL_ALIASES:
        skill_slug = alias_item["skill_slug"]
        alias = alias_item["alias"]
        normalized_alias = normalize_skill_alias_key(alias)
        if not normalized_alias or normalized_alias in seen_alias_keys:
            continue

        skill = get_skill_by_slug(db, skill_slug)
        if not skill:
            continue

        if _upsert_skill_alias(db, skill, alias):
            changed += 1
            seen_alias_keys.add(normalized_alias)

    if changed > 0:
        db.commit()

    return changed
