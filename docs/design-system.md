# Design System - GapDev (Baseline Atual)

Status: v1.0 (login, cadastro e rotas privadas)
Escopo atual: paginas publicas, shell autenticado e componentes compartilhados usados nas telas atuais (PageContainer, PageHeader, SectionCard, TabSwitcher, Input, TextArea, Button, Checkbox)

Este documento e vivo. Ele deve ser atualizado sempre que o visual base das paginas mudar.

## 1. Principios de UI

- Visual dark-first, com alto contraste para leitura.
- Identidade em azul/ciano, com acento principal em #3ec1e0.
- Superficies escuras em camadas: pagina, shell da aplicacao, paineis e cards.
- Cantos arredondados, bordas sutis e hover/focus em ciano claro.
- A pagina define a referencia visual do sistema, nao o contrario.

## 2. Paleta de Cores

### 2.1 Cores de marca

| Token | Valor | Uso |
|---|---|---|
| --color-brand-accent | #3ec1e0 | Destaques de texto e acentos |
| --color-brand-primary | #1b7895 | Botao primario e estados ativos |
| --color-brand-primary-hover | #1e6981 | Hover do primario |

### 2.2 Fundos e superficies

| Token | Valor | Uso |
|---|---|---|
| --color-bg-page-start | #000000 | Inicio do radial background da pagina |
| --color-bg-page-end | #012e49 | Fim do radial background da pagina |
| --color-bg-app-shell | #061c2d | Fundo do shell autenticado |
| --color-bg-shell | #02111b | Superficie glass principal |
| --color-bg-info-pane | #06324d | Painel de informacoes |
| --color-bg-form-pane | #001827 | Painel de formulario |
| --color-bg-feature-icon | #2b5f96 | Fundo do icone de feature |
| --color-bg-input | #051522 | Fundo padrao de inputs |
| --color-bg-input-hover | #072131 | Hover de inputs |
| --color-bg-checkbox | #051522 | Fundo do checkbox |
| --color-bg-secondary-hover | #02253b | Hover de botao secundario |
| --color-surface-panel | rgba(1, 30, 47, 0.82) | Cards e seccoes base |
| --color-surface-panel-hover | rgba(1, 30, 47, 0.9) | Hover de superficies base |
| --color-surface-switcher | rgba(1, 25, 39, 0.82) | Fundo do TabSwitcher |

### 2.3 Texto

| Token | Valor | Uso |
|---|---|---|
| --color-text-primary | #f8fbff | Texto principal |
| --color-text-heading-hero | #f5fbff | Titulo hero |
| --color-text-brand | #dff7ff | Nome da marca |
| --color-text-muted | #e8f6ff | Descricoes e subtitulos |
| --color-text-muted-soft | #e8f6ff | Texto auxiliar |
| --color-text-link | #52d8ff | Links e destaques | 
| --color-text-link-hover | #9aeaff | Hover de links |
| --color-text-icon | #b4d7e7 | Icones de campos |
| --color-text-icon-placeholder | #b4d7e7 | Placeholder |

### 2.4 Bordas, foco e efeitos

| Token | Valor | Uso |
|---|---|---|
| --color-border-shell | rgba(255, 255, 255, 0.18) | Borda de superfices principais |
| --color-border-shell-inner | rgba(255, 255, 255, 0.08) | Inset do shell glass |
| --color-border-input | rgba(255, 255, 255, 0.22) | Borda default de input |
| --color-border-input-hover | #58e0ff | Hover de input e bordas ativas |
| --color-border-input-focus | #58e0ff | Focus de input |
| --color-ring-focus | #58e0ff | Outline de foco visivel |
| --color-ring-focus-soft | #3ac0f0 | Glow de foco |
| --color-border-secondary | rgba(255, 255, 255, 0.24) | Botao secundario |
| --color-border-secondary-hover | #58e0ff | Hover do secundario |
| --color-border-checkbox | rgba(255, 255, 255, 0.4) | Checkbox default |
| --color-border-checkbox-checked | #67deff | Checkbox checked |

## 3. Tipografia

### 3.1 Familias

- Body/UI: Arimo, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- Heading/display: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif

### 3.2 Pesos usados

- 400: texto base
- 500: texto de apoio
- 600: labels e textos importantes
- 700: titulos menores, botoes e acentos
- 800: hero e titulos de destaque

### 3.3 Escala observada

| Elemento | Tamanho |
|---|---|
| Hero title | clamp(2.2rem, 4vw, 3.7rem) |
| Page title | clamp(1.9rem, 3.5vw, 2.4rem) |
| Form title | clamp(1.8rem, 2.2vw, 2.3rem) |
| Body default | 1rem |
| Label de input | 0.95rem |
| Texto auxiliar | 0.75rem a 0.92rem |

## 4. Espacamento e Layout

### 4.1 Espaamento base da pagina

- Mobile default: --page-pad-block: 1.7rem, --page-pad-inline: 1.7rem
- >= 768px: --page-pad-block: 2.2rem, --page-pad-inline: 2.2rem
- >= 1024px: --page-pad-block: 3.8rem, --page-pad-inline: 5.4rem

### 4.2 Largura e container

- `PageContainer` e o container base das paginas autenticadas.
- Largura padrao do container: 64rem.
- Telas com conteudo mais amplo podem usar uma variante expandida por pagina, hoje observada em 78rem e 84rem.
- Tokens semanticos relacionados: `--page-container-max-width` e `--page-container-max-width-expanded`.

### 4.3 Estrutura de pagina

- Padrao recorrente: `PageHeader` -> `TabSwitcher` -> conteudo principal.
- Páginas de analise usam `SectionCard` para o formulario principal.
- Listagens usam cards em superficie escura com borda sutil e hover leve.

### 4.4 Raios e cantos

| Elemento | Border radius |
|---|---|
| Shell principal | 1.7rem |
| Inputs e botao | 1rem |
| Cards e tabs | 1rem |
| Checkbox | 0.35rem |

## 5. Elevacao, sombras e blur

- Shell glass:
  - 0 34px 80px rgba(0, 0, 0, 1)
  - inset 0 0 0 1px rgba(255, 255, 255, 0.08)
  - backdrop-filter: blur(18px)
- Card/feature icon:
  - 0 12px 30px rgba(3, 18, 32, 1)
- Focus input:
  - 0 0 0 4px rgba(58, 192, 240, 0.22)

## 6. Componentes Baseline

### 6.1 Button

- Altura minima: 3.4rem
- Padding: 0.85rem 1.25rem
- Peso: 700
- Primary: fundo #1b7895, texto #f8fbff, hover #1e6981
- Secondary: fundo #001827, borda rgba(255,255,255,0.24), hover #02253b

### 6.2 Input

- Altura minima shell: 3.5rem
- Padding shell: 0.85rem 1rem
- Borda default: rgba(255, 255, 255, 0.22)
- Hover: borda #58e0ff, fundo #072131
- Focus: borda #58e0ff, glow 4px #3ac0f0

### 6.3 TextArea

- Usa a mesma linguagem visual do Input.
- Mantem alinhamento de iconografia, borda e focus do campo base.

### 6.4 Checkbox

- Box: 1.25rem x 1.25rem
- Checked: borda #67deff, fundo #1b7895
- Focus visible: outline 2px #58e0ff, offset 3px

### 6.5 PageHeader

- Titulo forte, subtitulo suave e alinhamento horizontal flexivel.
- Serve como topo padrao das paginas autenticadas.
- Tokens semanticos relacionados: `--page-header-title-size` e `--page-header-description-width`.

### 6.6 TabSwitcher

- Fundo escuro em camada separada.
- Estado ativo com fundo primario.
- Usa o mesmo raio e borda dos cards.

### 6.7 SectionCard

- Cartao de formulario principal.
- Usa borda sutil, fundo escuro e espaamento generoso entre header e corpo.

## 7. Motion e Interacao

- Duracao padrao: 160ms
- Curva padrao: ease
- Hover comum: translateY(-1px)
- Focus visible sempre presente para acessibilidade

## 8. Responsividade

- Breakpoints usados: 768px e 1024px
- Mobile-first
- Em desktop, o sistema pode abrir largura e respiracao do conteudo sem mudar a linguagem visual base

## 9. Governanca do Documento

Quando o visual base mudar, atualizar:

1. Tokens novos ou removidos
2. Componentes basicos afetados
3. Breakpoints e espacamentos
4. Versao e escopo no topo
