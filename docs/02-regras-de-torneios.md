# Regras de torneios

Este documento transforma o funcionamento esperado de torneios em regras práticas para implementação. O arquivo `Funcionamento de torneios.pdf` ainda não está presente no repositório; portanto, as regras abaixo usam as premissas declaradas em `AGENTS.md` e no escopo do projeto.

## Como um torneio é definido

Um torneio é definido por:

- Nome, modalidade e descrição.
- Organizador responsável.
- Janela de inscrições.
- Participantes ou equipes elegíveis.
- Formato competitivo.
- Critérios de seeding ou sorteio.
- Calendário de partidas.
- Regras de resultado.
- Critérios de ranking e desempate.
- Premiação, classificação ou objetivo final.
- Regras de W.O., atraso, contestação e correção.
- Status de publicação das tabelas, chaves e rankings.

## Decisões do organizador

Antes de publicar um torneio, o organizador deve decidir:

- Quem pode participar.
- Se a competição é individual ou por equipes.
- Quantidade mínima e máxima de participantes.
- Formato: mata-mata, pontos corridos, grupos + playoffs ou outro.
- Se haverá séries melhor de N.
- Se haverá disputa de terceiro lugar.
- Se haverá cabeças de chave.
- Se haverá sorteio aleatório.
- Como serão marcados horários e locais/servidores.
- Como resultados serão enviados e confirmados.
- Quais critérios de desempate serão aplicados.
- Como disputas serão resolvidas.

## Formato, seeding, draw, scheduling e ranking

**Formato** define a estrutura competitiva: mata-mata, pontos corridos, grupos, playoffs ou suíço.

**Seeding** define distribuição baseada em força, ranking, histórico ou semente manual justificada.

**Draw/sorteio** define alocação aleatória de participantes em posições, grupos ou confrontos.

**Scheduling** define data, hora, local/servidor, rodada, fase, ordem e status das partidas.

**Ranking** define como participantes são classificados a partir de resultados e desempates.

Esses conceitos devem ser modelados separadamente. Um torneio pode usar mata-mata com seeding, mata-mata com sorteio, grupos com seeding parcial ou pontos corridos sem sorteio.

## Critérios de qualidade

### Eficácia

O formato deve aumentar a chance de revelar os melhores participantes. Exemplo: pontos corridos tende a ser mais eficaz que mata-mata único, mas exige mais partidas.

### Justiça

Participantes equivalentes devem receber tratamento equilibrado. Seeding deve ser explícito e justificável. Sorteio deve ser auditável quando usado.

### Atratividade

O torneio precisa ser fácil de acompanhar. Chaves, grupos e rankings devem indicar fase, rodada, status, classificados e critérios usados.

### Incentivos e strategy-proofness

As regras devem reduzir incentivos para perder de propósito, manipular saldo ou escolher adversários. Critérios de desempate devem ser conhecidos antes do início.

## Regras para participantes

- Cada participante deve ter identificador único no torneio.
- Um participante não pode estar duplicado na mesma competição.
- Participante individual deve ter nome exibível e contato ou vínculo com perfil.
- Participantes podem ter status: pendente, aprovado, recusado, confirmado, desistente ou desclassificado.
- Participantes desistentes não devem receber novos agendamentos.

## Regras para equipes

- Cada equipe deve ter nome, capitão e lista de membros.
- O capitão representa a equipe em inscrições, check-in e envio de resultados.
- O número de membros deve respeitar limites do torneio.
- Alterações de escalação devem ser bloqueadas após prazo definido ou registradas em auditoria.
- Uma equipe pode ser desclassificada por W.O. repetido, irregularidade ou decisão administrativa justificada.

## Regras para partidas

- Toda partida deve pertencer a um torneio e, quando aplicável, a uma fase e rodada.
- Toda partida deve ter status claro.
- Status mínimos: pendente, agendada, ao vivo, finalizada, cancelada e em disputa.
- Partida agendada deve ter data, hora e local/servidor quando o torneio exigir.
- Resultado só pode ser registrado se a partida estiver em estado apropriado.
- Partida finalizada deve guardar placar, vencedor e histórico de confirmação.

## Regras para W.O.

- W.O. acontece quando participante ou equipe não comparece, atrasa além da tolerância ou descumpre regra objetiva de presença.
- O placar padrão de W.O. deve ser configurado por modalidade.
- W.O. deve ter justificativa e responsável pelo registro.
- W.O. pode ser contestado dentro de prazo definido.
- W.O. recorrente pode causar desclassificação se o regulamento prever.

## Regras para atraso

- O torneio deve definir tolerância de atraso.
- Atrasos devem ser registrados quando impactarem resultado ou agenda.
- O organizador pode remarcar partida, aplicar W.O. ou colocar em disputa.
- A decisão deve ser registrada com justificativa.

## Regras para confirmação de resultado

- Resultado enviado deve ser validado contra o formato da partida.
- Resultado pode ser confirmado automaticamente ou por organizador.
- Em partidas entre participantes, pode haver confirmação por ambos os lados.
- Resultado confirmado atualiza ranking, chave ou classificação.
- Resultado confirmado não deve ser alterado sem auditoria.

## Regras para contestação

- Participante, capitão ou organizador pode abrir contestação quando permitido.
- Contestação deve conter motivo e, no futuro, evidências.
- Partida contestada fica com status "em disputa".
- Ranking e chave derivados devem indicar que existem dados provisórios.
- Organizador resolve a disputa com decisão registrada.

## Regras para troca/correção de resultado

- Correções exigem permissão de organizador.
- Toda correção deve registrar valor anterior, valor novo, usuário, data e justificativa.
- Correção pode recalcular ranking, avanço de fase e partidas dependentes.
- Se a correção afetar partidas futuras já realizadas, o sistema deve alertar o organizador.

## Regras para publicação de chave e ranking

- Chave ou ranking podem ser rascunho, provisórios ou publicados.
- Informações provisórias devem ser sinalizadas na interface.
- Publicação deve registrar data e responsável.
- Alterações após publicação devem gerar auditoria.
- Ranking nunca deve esconder empate não resolvido.

