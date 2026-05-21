# CSS, responsividade e acessibilidade

Este documento consolida regras de front-end do projeto. Os arquivos `checklist-responsividade-design.md` e `frontend-boas-praticas.md` ainda não estão presentes no repositório; as regras abaixo seguem `AGENTS.md` e boas práticas exigidas para o sistema.

## Regras de CSS

- Usar CSS próprio.
- Usar variáveis CSS para cores, fontes, espaçamentos, sombras e raios.
- Usar `gap` em vez de margens improvisadas para espaçamento entre elementos.
- Evitar `!important`; usar apenas com justificativa.
- Evitar layout fixo.
- Preferir unidades relativas: `rem`, `%`, `svh`, `clamp()`, `min()`, `max()`.
- Não usar fonte escalada diretamente por viewport width.
- Manter `letter-spacing: 0` por padrão.

## Variáveis CSS obrigatórias

```css
:root {
  --color-bg: #f7f8fb;
  --color-surface: #ffffff;
  --color-text: #17202a;
  --color-text-muted: #5f6b7a;
  --color-primary: #006b5f;
  --color-accent: #f6b400;
  --color-border: #d7dde5;
  --color-danger: #b42318;
  --font-sans: system-ui, "Segoe UI", Roboto, Arial, sans-serif;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --radius-sm: 4px;
  --radius-md: 8px;
  --shadow-sm: 0 1px 2px rgb(16 24 40 / 0.08);
}
```

## Estrutura recomendada dos arquivos CSS

```text
src/styles/
├─ tokens.css
├─ reset.css
├─ base.css
├─ layout.css
├─ components.css
└─ utilities.css
```

## Breakpoints

Mobile-first:

```css
@media (min-width: 40rem) { /* tablets */ }
@media (min-width: 64rem) { /* desktops */ }
@media (min-width: 80rem) { /* telas amplas */ }
```

## Estratégia mobile-first

- Começar com layout de 320px.
- Aumentar complexidade com `min-width`.
- Priorizar conteúdo essencial no mobile.
- Evitar tabelas largas sem tratamento.

## Grid e Flexbox

- CSS Grid para estrutura principal de página.
- Flexbox para alinhamento interno de botões, badges, cards e toolbars.
- Usar `minmax()` em grids responsivos:

```css
.tournament-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: var(--space-4);
}
```

## Uso de clamp()

```css
.page-title {
  font-size: clamp(1.75rem, 1.4rem + 1vw, 2.5rem);
}
```

Usar para ajustar títulos dentro de limites seguros, sem depender de `vw` puro.

## Uso de min(), max() e minmax()

- `min()` limita largura em telas pequenas.
- `max()` garante tamanho mínimo quando necessário.
- `minmax()` evita colunas quebradas.

## Estados de foco

Todo elemento interativo deve ter `:focus-visible`:

```css
:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 2px;
}
```

## prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms;
    animation-iteration-count: 1;
    scroll-behavior: auto;
    transition-duration: 0.01ms;
  }
}
```

## Contraste

- Texto normal deve ter contraste suficiente contra o fundo.
- Badge não deve depender apenas de cor.
- Erros devem combinar cor, texto e ícone quando possível.

## Labels

- Todo input precisa de `label` associado.
- Placeholder não substitui label.
- Mensagens de erro devem estar ligadas ao campo com `aria-describedby` quando implementado.

## Navegação por teclado

- A ordem de tab deve seguir a ordem visual.
- Modais devem gerenciar foco.
- Menus e abas devem ser operáveis por teclado quando implementados.
- Ações destrutivas exigem confirmação clara.

## Checklist antes de finalizar uma tela

- Existe apenas um `h1`.
- Títulos seguem ordem correta.
- Todos os inputs têm label.
- Botões são `button`.
- Links são `a`.
- Estados hover, focus, active e disabled existem.
- Foco visível funciona.
- Layout funciona em 320px.
- Layout funciona em tablet e desktop.
- Não há texto sobreposto.
- Tabelas são legíveis no mobile.
- Estados vazio, loading, erro e sucesso estão previstos.
- `prefers-reduced-motion` é respeitado.
- Não há `!important` sem justificativa.

