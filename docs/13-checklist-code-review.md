# Checklist de code review

O arquivo `code_review.md` ainda não está presente no repositório. Este checklist usa as regras de `AGENTS.md` e deve ser revisado quando o documento original for adicionado.

## HTML

- Há apenas um `h1` por página.
- A ordem de títulos é lógica.
- Inputs têm `label`.
- Botões de ação usam `button`.
- Navegação usa `a` ou componente semanticamente equivalente.
- Imagens informativas têm texto alternativo.
- Estados vazios, erro e loading são representados no markup.

## CSS

- Usa variáveis CSS para tokens.
- Usa `gap` para espaçamento entre elementos.
- Evita `!important`.
- Não usa largura fixa que quebre no mobile.
- Usa Grid para estrutura principal quando adequado.
- Usa Flexbox para alinhamento interno.
- Estados hover, focus, active e disabled estão definidos.
- `prefers-reduced-motion` é respeitado.

## JavaScript/TypeScript

- Tipos representam o domínio corretamente.
- Funções de negócio são puras quando possível.
- Não há lógica complexa escondida dentro de componente visual.
- Erros são tratados explicitamente.
- Não há duplicação desnecessária.
- Nomes são claros e consistentes.
- Código compila com `npm run build`.
- Lint passa com `npm run lint`.

## Responsividade

- Layout funciona em 320px.
- Não há overflow horizontal indevido.
- Cards, tabelas e chaves continuam legíveis.
- Textos não sobrepõem componentes.
- Botões têm área de toque adequada.
- Grids usam `minmax()`, `auto-fit` ou alternativas fluidas quando necessário.

## Acessibilidade

- Foco visível funciona.
- Navegação por teclado é possível.
- Modais e menus não prendem usuário sem saída.
- Contraste é suficiente.
- Cor não é o único indicador de estado.
- Mensagens de erro são claras.
- Botões apenas com ícone têm `aria-label`.

## Design

- Visual é acadêmico, limpo e profissional.
- Paleta não fica dominada por uma única cor.
- Componentes seguem tokens de espaçamento, raio e sombra.
- Cards não são aninhados sem necessidade.
- Hierarquia visual ajuda a escanear informações.
- Estados provisórios de chave/ranking são claros.

## Algoritmos de torneio

- Formato está separado de seeding, sorteio, agenda e ranking.
- Byes são tratados explicitamente.
- Seeding não favorece manualmente participante sem justificativa.
- Sorteio é reproduzível ou auditável quando possível.
- Avanço de fase é consistente.
- Alterações em resultados recalculam dependências.

## Ranking

- Critérios de pontuação são configuráveis.
- Critérios de desempate são explícitos.
- Empates não resolvidos são sinalizados.
- Confronto direto é aplicado apenas quando válido.
- W.O. afeta ranking conforme regra documentada.

## Segurança básica

- Usuário sem permissão não executa ação restrita.
- Dados sensíveis não aparecem em página pública.
- Inputs são validados.
- Ações destrutivas pedem confirmação.
- Correções críticas geram auditoria.

## Performance

- Listas grandes têm renderização razoável.
- Componentes evitam recomputar algoritmos caros sem necessidade.
- Imagens são otimizadas.
- CSS não cria layout instável.
- Build final não inclui arquivos desnecessários.

## Manutenibilidade

- Arquivos têm responsabilidade clara.
- Componentes são reaproveitáveis sem abstração excessiva.
- Funções de domínio têm testes.
- Documentação é atualizada junto da mudança.
- Mudanças grandes são divididas em etapas revisáveis.

