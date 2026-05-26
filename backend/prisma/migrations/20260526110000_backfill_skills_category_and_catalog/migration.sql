-- Ensure skills schema has category/description and backfill the catalog.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE "skills"
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX IF NOT EXISTS "skills_category_idx" ON "skills"("category");

-- Normalize partially populated rows before matching/upserting.
UPDATE "skills"
SET
  "canonical_name" = CASE
    WHEN "canonical_name" IS NULL OR BTRIM("canonical_name") = '' THEN
      COALESCE(NULLIF(BTRIM("slug"), ''), 'skill-' || SUBSTRING("id", 1, 8))
    ELSE "canonical_name"
  END,
  "slug" = CASE
    WHEN "slug" IS NULL OR BTRIM("slug") = '' THEN
      REGEXP_REPLACE(
        LOWER(COALESCE(NULLIF(BTRIM("canonical_name"), ''), 'skill-' || SUBSTRING("id", 1, 8))),
        '[^a-z0-9]+',
        '-',
        'g'
      ) || '-' || SUBSTRING("id", 1, 8)
    ELSE "slug"
  END,
  "active" = COALESCE("active", true)
WHERE
  "canonical_name" IS NULL
  OR BTRIM("canonical_name") = ''
  OR "slug" IS NULL
  OR BTRIM("slug") = ''
  OR "active" IS NULL;

WITH catalog("slug", "canonical_name", "category", "description") AS (
  VALUES
    ('javascript', 'JavaScript', 'Linguagens', 'Linguagem de programacao para web'),
    ('typescript', 'TypeScript', 'Linguagens', 'Superset tipado de JavaScript'),
    ('python', 'Python', 'Linguagens', 'Linguagem versatil para backend e IA'),
    ('java', 'Java', 'Linguagens', 'Linguagem orientada a objetos multiplataforma'),
    ('csharp', 'C#', 'Linguagens', 'Linguagem moderna para ecossistema .NET'),
    ('go', 'Go', 'Linguagens', 'Linguagem performatica para servicos concorrentes'),
    ('rust', 'Rust', 'Linguagens', 'Linguagem focada em seguranca de memoria'),
    ('kotlin', 'Kotlin', 'Linguagens', 'Linguagem moderna para Android e backend'),
    ('swift', 'Swift', 'Linguagens', 'Linguagem para desenvolvimento iOS e macOS'),
    ('php', 'PHP', 'Linguagens', 'Linguagem amplamente usada para web'),
    ('sql', 'SQL', 'Linguagens', 'Linguagem de consulta para bancos relacionais'),
    ('react', 'React', 'Frontend', 'Biblioteca JavaScript para interfaces'),
    ('next-js', 'Next.js', 'Frontend', 'Framework React para aplicacoes web'),
    ('vue-js', 'Vue.js', 'Frontend', 'Framework progressivo para interfaces web'),
    ('angular', 'Angular', 'Frontend', 'Framework frontend completo para SPAs'),
    ('svelte', 'Svelte', 'Frontend', 'Framework compilado para interfaces reativas'),
    ('tailwind-css', 'Tailwind CSS', 'Frontend', 'Framework utilitario de estilos CSS'),
    ('bootstrap', 'Bootstrap', 'Frontend', 'Framework CSS para interfaces responsivas'),
    ('sass', 'Sass', 'Frontend', 'Pre-processador CSS com recursos avancados'),
    ('storybook', 'Storybook', 'Frontend', 'Documentacao e desenvolvimento de componentes UI'),
    ('node-js', 'Node.js', 'Backend', 'Runtime JavaScript para backend'),
    ('express-js', 'Express.js', 'Backend', 'Framework minimalista para APIs Node.js'),
    ('fastapi', 'FastAPI', 'Backend', 'Framework Python para APIs'),
    ('django', 'Django', 'Backend', 'Framework Python completo para aplicacoes web'),
    ('flask', 'Flask', 'Backend', 'Microframework Python para servicos web'),
    ('spring-boot', 'Spring Boot', 'Backend', 'Framework Java para microsservicos e APIs'),
    ('dotnet', '.NET', 'Backend', 'Plataforma para aplicacoes enterprise'),
    ('nestjs', 'NestJS', 'Backend', 'Framework Node.js estruturado e escalavel'),
    ('react-native', 'React Native', 'Mobile', 'Framework mobile multiplataforma'),
    ('flutter', 'Flutter', 'Mobile', 'Framework para aplicativos moveis'),
    ('android', 'Android', 'Mobile', 'Desenvolvimento nativo para dispositivos Android'),
    ('ios', 'iOS', 'Mobile', 'Desenvolvimento nativo para dispositivos Apple'),
    ('postgresql', 'PostgreSQL', 'Banco de Dados', 'Banco de dados relacional'),
    ('mongodb', 'MongoDB', 'Banco de Dados', 'Banco de dados NoSQL'),
    ('mysql', 'MySQL', 'Banco de Dados', 'Banco de dados relacional amplamente utilizado'),
    ('mariadb', 'MariaDB', 'Banco de Dados', 'Banco de dados relacional compativel com MySQL'),
    ('sqlite', 'SQLite', 'Banco de Dados', 'Banco de dados embarcado e leve'),
    ('redis', 'Redis', 'Banco de Dados', 'Banco em memoria para cache e mensageria'),
    ('firebase', 'Firebase', 'Banco de Dados', 'Plataforma backend com servicos gerenciados'),
    ('elasticsearch', 'Elasticsearch', 'Banco de Dados', 'Mecanismo de busca e analise distribuida'),
    ('docker', 'Docker', 'DevOps & Cloud', 'Ferramenta de containers'),
    ('kubernetes', 'Kubernetes', 'DevOps & Cloud', 'Orquestracao de containers em escala'),
    ('terraform', 'Terraform', 'DevOps & Cloud', 'Infraestrutura como codigo declarativa'),
    ('ansible', 'Ansible', 'DevOps & Cloud', 'Automacao de configuracao e provisionamento'),
    ('jenkins', 'Jenkins', 'DevOps & Cloud', 'Servidor de integracao continua'),
    ('gitlab-ci', 'GitLab CI', 'DevOps & Cloud', 'Pipelines de CI/CD no GitLab'),
    ('nginx', 'Nginx', 'DevOps & Cloud', 'Servidor web e proxy reverso'),
    ('linux', 'Linux', 'DevOps & Cloud', 'Sistema operacional para servidores e automacao'),
    ('aws', 'AWS', 'DevOps & Cloud', 'Servicos em nuvem'),
    ('azure', 'Azure', 'DevOps & Cloud', 'Plataforma de nuvem da Microsoft'),
    ('gcp', 'Google Cloud Platform', 'DevOps & Cloud', 'Plataforma de nuvem do Google'),
    ('postman', 'Postman', 'Ferramentas', 'Teste e documentacao de APIs'),
    ('insomnia', 'Insomnia', 'Ferramentas', 'Cliente para APIs REST'),
    ('swagger-openapi', 'Swagger/OpenAPI', 'Ferramentas', 'Especificacao e documentacao de APIs'),
    ('jira', 'Jira', 'Ferramentas', 'Gestao de tarefas e projetos ageis'),
    ('jest', 'Jest', 'Testes', 'Framework de testes JavaScript'),
    ('cypress', 'Cypress', 'Testes', 'Testes end-to-end'),
    ('pytest', 'Pytest', 'Testes', 'Framework de testes para Python'),
    ('playwright', 'Playwright', 'Testes', 'Automacao cross-browser para testes E2E'),
    ('selenium', 'Selenium', 'Testes', 'Automacao de navegadores para testes'),
    ('vitest', 'Vitest', 'Testes', 'Framework de testes rapido para Vite'),
    ('figma', 'Figma', 'UI/UX', 'Design de interfaces'),
    ('adobe-xd', 'Adobe XD', 'UI/UX', 'Prototipacao e design de interfaces digitais'),
    ('design-system', 'Design System', 'UI/UX', 'Sistema visual reutilizavel'),
    ('machine-learning', 'Machine Learning', 'IA', 'Modelos inteligentes e preditivos'),
    ('tensorflow', 'TensorFlow', 'IA', 'Framework para IA'),
    ('pytorch', 'PyTorch', 'IA', 'Framework para deep learning e pesquisa em IA'),
    ('langchain', 'LangChain', 'IA', 'Orquestracao de aplicacoes com LLMs'),
    ('openai-api', 'OpenAI API', 'IA', 'Integracao de modelos de linguagem e multimodais'),
    ('nlp', 'NLP', 'IA', 'Processamento de linguagem natural'),
    ('computer-vision', 'Computer Vision', 'IA', 'Tecnicas de visao computacional'),
    ('jwt', 'JWT', 'Ciberseguranca', 'Autenticacao baseada em tokens'),
    ('oauth', 'OAuth', 'Ciberseguranca', 'Autorizacao segura'),
    ('owasp', 'OWASP', 'Ciberseguranca', 'Boas praticas para seguranca de aplicacoes web'),
    ('keycloak', 'Keycloak', 'Ciberseguranca', 'Gestao de identidade e acesso'),
    ('pandas', 'Pandas', 'Dados', 'Manipulacao de dados em Python'),
    ('numpy', 'NumPy', 'Dados', 'Computacao numerica e estruturas de arrays'),
    ('apache-spark', 'Apache Spark', 'Dados', 'Processamento distribuido de dados em grande escala'),
    ('dbt', 'dbt', 'Dados', 'Transformacao de dados em data warehouses'),
    ('tableau', 'Tableau', 'Dados', 'Business intelligence e visualizacao analitica'),
    ('power-bi', 'Power BI', 'Dados', 'Visualizacao de dados'),
    ('kafka', 'Apache Kafka', 'Dados', 'Plataforma distribuida de streaming de eventos'),
    ('rabbitmq', 'RabbitMQ', 'Dados', 'Broker de mensageria baseado em filas'),
    ('unity', 'Unity', 'Game Dev', 'Engine para jogos'),
    ('godot', 'Godot', 'Game Dev', 'Engine open-source para desenvolvimento de jogos'),
    ('unreal-engine', 'Unreal Engine', 'Game Dev', 'Engine grafica para jogos'),
    ('bubble', 'Bubble', 'Low Code', 'Plataforma low code'),
    ('flutterflow', 'FlutterFlow', 'Low Code', 'Construcao visual de apps'),
    ('rest', 'REST', 'APIs', 'Arquitetura para APIs'),
    ('graphql', 'GraphQL', 'APIs', 'Linguagem de consulta para APIs'),
    ('grpc', 'gRPC', 'APIs', 'Framework de RPC de alta performance'),
    ('websockets', 'WebSockets', 'APIs', 'Comunicacao bidirecional em tempo real'),
    ('wordpress', 'WordPress', 'CMS', 'CMS para sites'),
    ('strapi', 'Strapi', 'CMS', 'CMS Headless'),
    ('contentful', 'Contentful', 'CMS', 'CMS headless SaaS para conteudo estruturado'),
    ('sanity', 'Sanity', 'CMS', 'CMS headless com conteudo em tempo real'),
    ('git', 'Git', 'Versionamento', 'Controle de versao'),
    ('github', 'GitHub', 'Versionamento', 'Hospedagem de repositorios'),
    ('gitlab', 'GitLab', 'Versionamento', 'Hospedagem e colaboracao de repositorios Git'),
    ('bitbucket', 'Bitbucket', 'Versionamento', 'Plataforma de repositorios Git para equipes'),
    ('clean-architecture', 'Clean Architecture', 'Arquitetura', 'Arquitetura escalavel de software'),
    ('microservices', 'Microservices', 'Arquitetura', 'Arquitetura distribuida'),
    ('ddd', 'Domain-Driven Design', 'Arquitetura', 'Modelagem de software guiada pelo dominio'),
    ('event-driven-architecture', 'Event-Driven Architecture', 'Arquitetura', 'Arquitetura orientada a eventos'),
    ('solid', 'SOLID', 'Arquitetura', 'Principios de design orientado a objetos'),
    ('prometheus', 'Prometheus', 'Observabilidade', 'Coleta e armazenamento de metricas'),
    ('grafana', 'Grafana', 'Observabilidade', 'Visualizacao de metricas e dashboards'),
    ('kibana', 'Kibana', 'Observabilidade', 'Visualizacao e exploracao de logs e eventos')
),
matched_backfill AS (
  UPDATE "skills" s
  SET
    "category" = CASE
      WHEN s."category" IS NULL OR BTRIM(s."category") = '' THEN c."category"
      ELSE s."category"
    END,
    "description" = CASE
      WHEN s."description" IS NULL OR BTRIM(s."description") = '' THEN c."description"
      ELSE s."description"
    END,
    "active" = true
  FROM catalog c
  WHERE
    LOWER(s."slug") = c."slug"
    OR LOWER(s."canonical_name") = LOWER(c."canonical_name")
)
INSERT INTO "skills" ("id", "slug", "canonical_name", "category", "description", "active")
SELECT gen_random_uuid()::text, c."slug", c."canonical_name", c."category", c."description", true
FROM catalog c
ON CONFLICT ("slug") DO UPDATE
SET
  "canonical_name" = COALESCE(NULLIF("skills"."canonical_name", ''), EXCLUDED."canonical_name"),
  "category" = COALESCE(NULLIF("skills"."category", ''), EXCLUDED."category"),
  "description" = COALESCE(NULLIF("skills"."description", ''), EXCLUDED."description"),
  "active" = true;

COMMIT;
