# Design System - GapDev (Baseado na Tela de Login)

Status: v0.2 (login + cadastro)
Escopo atual: paginas de login/cadastro e componentes usados nelas (Button, Input, Checkbox)

Este documento e vivo. Ele deve ser atualizado sempre que um novo padrao visual for criado, alterado ou removido.

## 1. Principios de UI

- Visual dark-first com contraste alto para leitura.
- Identidade em azul/ciano com acento principal em #3ec1e0.
- Cantos arredondados e superfices com efeito glass (borda clara + blur + sombras).
- Feedback de hover/focus com ciano claro.

## 2. Paleta de Cores

### 2.1 Cores de marca

| Token sugerido | Valor | Uso atual |
|---|---|---|
| color-brand-accent | #3ec1e0 | Destaques de texto (Dev, carreira) |
| color-brand-primary | #1b7895 | Botao primario, checkbox checked |
| color-brand-primary-hover | #1e6981 | Hover botao primario |

### 2.2 Fundos e superficies

| Token sugerido | Valor | Uso atual |
|---|---|---|
| color-bg-page-start | #000000 | Inicio do radial gradient da pagina |
| color-bg-page-end | #012e49 | Fim do radial gradient da pagina |
| color-bg-shell | #02111b | Container principal do login |
| color-bg-info-pane | #06324d | Painel de informacoes |
| color-bg-form-pane | #001827 | Painel de formulario |
| color-bg-feature-icon | #2b5f96 | Cartao do icone de feature |
| color-bg-input | #051522 | Campo de input |
| color-bg-input-hover | #072131 | Hover do input |
| color-bg-checkbox | #051522 | Fundo checkbox |
| color-bg-secondary-hover | #02253b | Hover botao secundario |

### 2.3 Texto

| Token sugerido | Valor | Uso atual |
|---|---|---|
| color-text-primary | #f8fbff | Texto principal e botoes |
| color-text-heading-hero | #f5fbff | Titulo hero |
| color-text-brand | #dff7ff | Nome da marca |
| color-text-muted | #e8f6ff | Descricoes e subtitulos |
| color-text-muted-soft | #e8f6ff | Texto do divisor |
| color-text-link | #52d8ff | Links inline |
| color-text-link-hover | #9aeaff | Hover de links |
| color-text-icon | #b4d7e7 | Icones de input |
| color-text-icon-placeholder | #b4d7e7 | Placeholder |

### 2.4 Bordas, foco e efeitos

| Token sugerido | Valor | Uso atual |
|---|---|---|
| color-border-shell | #ffffff | Borda container shell |
| color-border-shell-inner | #ffffff | Inset shell |
| color-border-input | #ffffff | Input default |
| color-border-input-hover | #58e0ff | Input hover |
| color-border-input-focus | #58e0ff | Input focus |
| color-ring-focus | #58e0ff | Outline focus button/checkbox |
| color-ring-focus-soft | #3ac0f0 | Glow focus input |
| color-border-secondary | #ffffff | Botao secundario |
| color-border-secondary-hover | #58e0ff | Hover botao secundario |
| color-border-checkbox | #ffffff | Checkbox default |
| color-border-checkbox-checked | #67deff | Checkbox checked |

## 3. Tipografia

## 3.1 Familias

- Font body/UI: Arimo, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- Font display/brand: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif

## 3.2 Pesos usados

- 400: texto base
- 500: opcional em body
- 600: labels e textos de apoio importantes
- 700: titulos menores, botoes, marca
- 800: destaque forte (hero accent e titulo do form)

## 3.3 Escala de tamanho (observada)

| Elemento | Tamanho |
|---|---|
| Hero title | clamp(2.2rem, 4vw, 3.7rem) |
| Form title | clamp(1.8rem, 2.2vw, 2.3rem) |
| Brand name | 2rem |
| Body default | 1rem |
| Feature title | 1rem |
| Label de input | 0.95rem |
| Texto divisor | 0.92rem |

## 4. Espacamento e Layout

## 4.1 Espaçamento base da pagina

- Mobile default:
	- --page-pad-block: 1.7rem
	- --page-pad-inline: 1.7rem
- >= 768px:
	- --page-pad-block: 2.2rem
	- --page-pad-inline: 2.2rem
- >= 1024px:
	- --page-pad-block: 3.8rem
	- --page-pad-inline: 5.4rem

## 4.2 Grid principal

- Mobile/tablet: ordem visual info em cima e form embaixo.
- Desktop (>=1024px): 2 colunas iguais (50/50).

## 4.3 Raios e cantos

| Elemento | Border radius |
|---|---|
| Shell principal | 1.7rem |
| Input e Button | 1rem |
| Feature icon | 1rem |
| Checkbox box | 0.35rem |

## 5. Elevacao, sombras e blur

- Shell:
	- 0 34px 80px #000000
	- inset 0 0 0 1px #ffffff
	- backdrop-filter: blur(18px)
- Feature icon:
	- 0 12px 30px #031220
- Focus input:
	- 0 0 0 4px #3ac0f0

## 6. Iconografia

- Biblioteca atual: react-icons/fa6
- Tamanho tipico:
	- Feature icon wrapper: 3.2rem, icone interno 1.5rem
	- Input/botao icon wrapper: 1.25rem a 1.4rem
- Cor padrao de icone em campo: #b4d7e7
- Cor hover de icone interativo: #75e7ff

## 7. Componentes (Baseline)

## 7.1 Button

- Altura minima: 3.4rem
- Padding: 0.85rem 1.25rem
- Peso: 700
- Focus visible: outline 2px #58e0ff, offset 3px
- Variantes:
	- Primary: bg #1b7895, texto #f8fbff, hover #1e6981
	- Secondary: bg #001827, border #ffffff, hover bg #02253b

## 7.2 Input

- Altura minima shell: 3.5rem
- Padding shell: 0.85rem 1rem
- Border default: #ffffff
- Hover: border #58e0ff, bg #072131
- Focus: border #58e0ff, glow 4px #3ac0f0
- Label: 0.95rem, 600

## 7.3 Checkbox

- Box: 1.25rem x 1.25rem
- Border default: #ffffff
- Checked: border #67deff, bg #1b7895
- Focus visible: outline 2px #58e0ff, offset 3px

## 8. Motion e Interacao

- Duracao padrao: 160ms
- Curva padrao: ease
- Hover comum: translateY(-1px)
- Sempre manter estado de focus visible para acessibilidade em teclado.

## 9. Responsividade

- Breakpoints observados:
	- md: 768px
	- lg: 1024px
- Regras principais:
	- Mobile-first
	- Em desktop, hero title pode usar nowrap por linha
	- Em mobile/tablet, permitir quebra de linha do titulo

## 10. Governanca do Documento

Sempre que o design mudar, atualizar:

1. Tokens novos/removidos
2. Mudancas de componente
3. Novos breakpoints/regras responsivas
4. Data e versao no topo

