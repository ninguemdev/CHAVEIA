# AGENTS.md

Este projeto é um sistema web acadêmico da UTFPR para organização de torneios, e-sports e competições gerais.

## Stack

- Vite
- React
- TypeScript
- CSS próprio
- GitHub para versionamento
- Notion para organização
- Codex para auxílio no desenvolvimento

## Comandos

Instalar dependências:

```bash
npm install



## Projeto

Este projeto é um sistema web acadêmico da UTFPR para organização de torneios.

Sempre siga estas regras:

## Objetivo do sistema

Criar uma plataforma completa para torneios, com foco em:

- Cadastro de torneios.
- Cadastro de participantes, jogadores e equipes.
- Inscrições.
- Check-in.
- Formatos de competição.
- Chaves e tabelas.
- Agendamento de partidas.
- Registro e validação de resultados.
- Ranking e desempates.
- Painel do organizador.
- Página pública do torneio.
- Visual moderno, responsivo e acessível.

## Referências obrigatórias

Sempre use como base estes documentos do projeto:

- Funcionamento de torneios.pdf
- AGENTS.md
- checklist-responsividade-design.md
- code_review.md
- frontend-boas-praticas.md

## Princípios de torneio

Ao criar regras ou algoritmos, considere:

1. Formato:
   - Mata-mata simples.
   - Mata-mata com séries melhor de N.
   - Pontos corridos.
   - Fase de grupos.
   - Grupos + playoffs.
   - Sistema suíço como recurso avançado.
   - Formatos híbridos.

2. Seeding:
   - Permitir cabeças de chave.
   - Evitar confronto precoce entre favoritos quando houver ranking/semente.
   - Permitir sorteio aleatório quando o organizador escolher.

3. Scheduling:
   - Partidas devem ter data, hora, local/servidor e fase.
   - Evitar conflitos de horário para o mesmo participante.
   - Considerar tempo mínimo entre partidas quando possível.
   - Permitir partidas pendentes, ao vivo, finalizadas, canceladas e em disputa.

4. Ranking:
   - Critérios de pontuação devem ser configuráveis.
   - Critérios de desempate devem ser explícitos.
   - Nunca deixar ranking ambíguo sem explicar o critério usado.
   - Registrar histórico dos resultados.

5. Justiça e integridade:
   - Não criar regra que favoreça manualmente um participante sem justificativa.
   - Registrar alterações importantes em log/auditoria.
   - Resultados devem poder ser confirmados, contestados e corrigidos por organizadores.
   - O sistema deve deixar claro quando uma tabela/chave ainda é provisória.

## Regras de front-end

Sempre criar interfaces com:

- HTML semântico.
- Apenas um h1 por página.
- Ordem correta de títulos.
- Inputs com label.
- Botões reais usando button.
- Links reais usando a.
- Estados de hover, focus, active e disabled.
- Foco visível com :focus-visible.
- Responsividade mobile-first.
- Layout funcionando de 320px até desktop.
- Grid para estrutura principal.
- Flexbox para alinhamento interno.
- Variáveis CSS para cores, fontes, espaçamentos, sombras e raios.
- `gap` em vez de margens improvisadas.
- `clamp()`, `min()`, `max()`, `rem`, `%` quando fizer sentido.
- Sem `!important`, exceto se for realmente inevitável.
- Sem layout fixo que quebre no celular.
- Respeito a `prefers-reduced-motion`.

## Visual desejado

O site deve parecer:

- Moderno.
- Acadêmico.
- Confiável.
- Limpo.
- Organizado.
- Responsivo.
- Profissional.
- Adequado para torneios e e-sports.

Use uma identidade visual inspirada em:

- Ambiente universitário.
- Tecnologia.
- Competição.
- Tabelas/chaves esportivas.
- Dashboard de organização.

Evite visual infantil, poluído ou genérico demais.

## Qualidade do código

Antes de finalizar qualquer tarefa:

1. Verifique se o código compila.
2. Verifique se não há erro óbvio de lint.
3. Verifique responsividade.
4. Verifique acessibilidade básica.
5. Verifique estados vazios, erro e loading.
6. Verifique se a alteração está documentada.
7. Não faça grandes refactors sem explicar.
8. Não misture muitas funcionalidades em um único commit/patch.
9. Prefira código claro em vez de código excessivamente abstrato.
10. Explique o que foi alterado e quais arquivos foram afetados.

## Formato das respostas

Sempre responder com:

1. Resumo do que foi feito.
2. Arquivos alterados/criados.
3. Como testar.
4. Próximos passos recomendados.
5. Observações de risco, se houver.