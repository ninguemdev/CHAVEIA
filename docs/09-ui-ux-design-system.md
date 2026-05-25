# UI, UX e design system

## Personalidade visual

O produto deve parecer acadêmico, confiável, moderno, limpo e organizado. A identidade deve combinar ambiente universitário, tecnologia, competição e dashboards de organização.

Evitar visual infantil, excesso de efeitos, paleta monocromática e elementos decorativos sem função.

## Paleta de cores

Tokens sugeridos:

```css
:root {
  --color-bg: #f7f8fb;
  --color-surface: #ffffff;
  --color-surface-muted: #eef2f6;
  --color-text: #17202a;
  --color-text-muted: #5f6b7a;
  --color-primary: #006b5f;
  --color-primary-strong: #004c45;
  --color-accent: #f6b400;
  --color-danger: #b42318;
  --color-warning: #b54708;
  --color-success: #067647;
  --color-info: #175cd3;
  --color-border: #d7dde5;
}
```

## Tipografia

- Fonte principal: sistema (`system-ui`, `Segoe UI`, `Roboto`, `Arial`, sans-serif).
- Títulos: peso 600 ou 700.
- Corpo: peso 400.
- Dados tabulares: fonte principal ou mono apenas quando necessário.
- Não escalar fonte diretamente com viewport.

## Escala de espaçamento

```css
--space-1: 0.25rem;
--space-2: 0.5rem;
--space-3: 0.75rem;
--space-4: 1rem;
--space-5: 1.5rem;
--space-6: 2rem;
--space-7: 3rem;
```

## Raios

- Pequeno: `4px`.
- Padrão: `8px`.
- Grande: `12px`, apenas em containers maiores.
- Cards devem usar até `8px`, salvo necessidade específica.

## Sombras

Sombras devem ser discretas:

```css
--shadow-sm: 0 1px 2px rgb(16 24 40 / 0.08);
--shadow-md: 0 8px 24px rgb(16 24 40 / 0.10);
```

## Grid e layouts

- Layout principal com CSS Grid.
- Alinhamentos internos com Flexbox.
- Usar `gap` para espaçamento.
- Evitar largura fixa que quebre no mobile.
- Conteúdo principal com `max-width` e padding fluido.

## Componentes

### SiteHeader

- Header global renderizado por `AuthenticatedShell` nas paginas principais.
- Usa links reais para navegacao e botao real apenas para abrir/fechar o menu mobile.
- Links mudam conforme estado do usuario: visitante, usuario autenticado, criador autorizado e admin.
- O menu mobile deve fechar ao navegar ou pressionar Escape.

### PageBackButton

- Botao reutilizavel exibido no topo das paginas internas.
- Texto visivel: "Voltar"; o icone e complementar.
- Usa `history.back()` quando possivel e fallback para rota segura.
- A home nao usa este componente.

### Button

- Variantes: primary, secondary, ghost, danger.
- Estados: hover, focus-visible, active, disabled, loading.
- Usar `button` real para ações.

### Card

- Usar para itens repetidos: torneio, partida, participante.
- Não criar cards dentro de cards.
- Deve ter título, metadados e ações claras.

### Badge

- Usar para status: aberto, em andamento, finalizado, em disputa, provisório.
- Não depender apenas de cor; texto deve explicar.

### Input

- Sempre com label.
- Mensagem de erro ligada ao campo.
- Área mínima de toque adequada.

### Select

- Usar para opções fechadas: formato, status, fase.
- Deve ter label e estado disabled.

### Modal

- Usar para decisões focadas, como confirmar correção.
- Deve prender foco e permitir fechar com ação clara.

### Toast

- Usar para feedback breve.
- Não substituir mensagem persistente em erro crítico.

### Table

- Usar para ranking, participantes e auditoria.
- Deve funcionar em mobile com rolagem controlada ou layout alternativo.

### Tabs

- Usar para seções de torneio: visão geral, partidas, chave, ranking.
- Estado ativo deve ser perceptível.

### Empty state

- Deve dizer o que falta e qual ação executar.

### Loading state

- Usar skeleton ou mensagem curta.
- Evitar saltos de layout.

### Error state

- Explicar problema e sugerir retry ou retorno.

### Tournament card

- Exibir nome, modalidade, status, datas, formato e ação principal.

### Match card

- Exibir participantes, placar, fase, rodada, horário, local e status.

### Bracket match

- Exibir slots, seed, placar, vencedor e estado provisório.

### Ranking table

- Exibir posição, participante, pontos, vitórias, empates, derrotas, saldo e critérios.

### Participant list

- Exibir nome, tipo, status, check-in e ações permitidas.

### Timeline

- Exibir eventos importantes: inscrição, geração de chave, resultados e disputas.

## Regras de ícones

- Ícones devem reforçar ações, não substituir texto em comandos ambíguos.
- Botões apenas com ícone precisam de `aria-label`.
- Usar biblioteca consistente quando adicionada ao projeto.

## Microinterações

- Transições curtas: 120ms a 200ms.
- Respeitar `prefers-reduced-motion`.
- Hover e active devem comunicar clicabilidade.
- Focus-visible deve ser sempre claro.
