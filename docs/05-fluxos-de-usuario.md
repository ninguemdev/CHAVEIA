# Fluxos de usuário

## Organizador cria torneio

- **Ator:** organizador.
- **Pré-condições:** usuário autenticado ou modo local habilitado no MVP.
- **Passos:** acessar dashboard; clicar em criar torneio; preencher nome, modalidade, datas e descrição; salvar rascunho.
- **Erros possíveis:** campos obrigatórios ausentes; datas inválidas; nome duplicado no mesmo contexto.
- **Estado final:** torneio criado como rascunho.

## Organizador define formato

- **Ator:** organizador.
- **Pré-condições:** torneio em rascunho ou configuração aberta.
- **Passos:** abrir configurações; escolher formato; definir melhor de N, terceiro lugar, pontuação e desempates; salvar.
- **Erros possíveis:** formato incompatível com número de participantes; configuração incompleta.
- **Estado final:** torneio possui formato validável.

## Organizador abre inscrições

- **Ator:** organizador.
- **Pré-condições:** torneio configurado com limites e período de inscrição.
- **Passos:** revisar regras; definir janela; publicar inscrições.
- **Erros possíveis:** datas inválidas; limite máximo menor que mínimo; torneio sem modalidade.
- **Estado final:** status `registration_open`.

## Participante se inscreve

- **Ator:** participante.
- **Pré-condições:** inscrições abertas.
- **Passos:** acessar página pública; preencher dados; aceitar regras; enviar inscrição.
- **Erros possíveis:** inscrições fechadas; participante duplicado; dados obrigatórios ausentes.
- **Estado final:** inscrição pendente ou aprovada.

## Capitão cria equipe

- **Ator:** capitão.
- **Pré-condições:** torneio por equipes com inscrições abertas.
- **Passos:** informar nome da equipe; adicionar membros; confirmar inscrição.
- **Erros possíveis:** equipe sem membros mínimos; membro duplicado; limite de equipe excedido.
- **Estado final:** equipe criada e vinculada à inscrição.

## Organizador fecha inscrições

- **Ator:** organizador.
- **Pré-condições:** inscrições abertas.
- **Passos:** revisar inscritos; aprovar ou recusar pendências; fechar inscrições.
- **Erros possíveis:** participantes abaixo do mínimo; inscrições pendentes sem decisão.
- **Estado final:** status `registration_closed`.

## Organizador gera chave/tabela

- **Ator:** organizador.
- **Pré-condições:** inscrições fechadas e participantes aprovados.
- **Passos:** escolher seeding ou sorteio; gerar estrutura; revisar; publicar ou manter provisória.
- **Erros possíveis:** participantes insuficientes; seeds duplicados; conflito de configuração.
- **Estado final:** chave, grupos ou tabela criada.

## Jogador faz check-in

- **Ator:** jogador ou capitão.
- **Pré-condições:** check-in aberto.
- **Passos:** acessar torneio; confirmar presença; receber confirmação.
- **Erros possíveis:** janela fechada; participante não aprovado; equipe incompleta.
- **Estado final:** participante marcado como confirmado.

## Partida acontece

- **Ator:** participantes e organizador.
- **Pré-condições:** partida agendada e participantes aptos.
- **Passos:** participantes entram no local/servidor; partida muda para ao vivo; jogo é disputado.
- **Erros possíveis:** atraso; ausência; problema técnico; participante irregular.
- **Estado final:** partida pronta para receber resultado, W.O. ou contestação.

## Resultado é enviado

- **Ator:** capitão, jogador ou organizador.
- **Pré-condições:** partida permite envio de resultado.
- **Passos:** informar placar; anexar observação quando necessário; enviar.
- **Erros possíveis:** placar inválido; empate não permitido; série incompleta.
- **Estado final:** resultado submetido.

## Resultado é confirmado

- **Ator:** organizador ou participantes conforme regra.
- **Pré-condições:** resultado submetido.
- **Passos:** revisar placar; confirmar; atualizar chave/ranking.
- **Erros possíveis:** resultado inconsistente; contestação aberta.
- **Estado final:** resultado confirmado e efeitos aplicados.

## Resultado é contestado

- **Ator:** participante, capitão ou organizador.
- **Pré-condições:** resultado submetido ou confirmado dentro do prazo de contestação.
- **Passos:** abrir contestação; informar motivo; enviar.
- **Erros possíveis:** prazo encerrado; usuário sem vínculo com partida; motivo vazio.
- **Estado final:** partida marcada como em disputa.

## Organizador resolve disputa

- **Ator:** organizador.
- **Pré-condições:** disputa aberta.
- **Passos:** analisar motivo; decidir manter, corrigir ou anular resultado; registrar justificativa.
- **Erros possíveis:** decisão sem justificativa; impacto em partidas dependentes.
- **Estado final:** disputa resolvida e auditoria registrada.

## Ranking é atualizado

- **Ator:** sistema.
- **Pré-condições:** resultado confirmado ou corrigido.
- **Passos:** recalcular tabela; aplicar desempates; marcar empates não resolvidos; atualizar exibição.
- **Erros possíveis:** critério de desempate inválido; dados incompletos.
- **Estado final:** ranking atualizado e critérios visíveis.

## Torneio é finalizado

- **Ator:** organizador.
- **Pré-condições:** partidas decisivas finalizadas ou decisão administrativa registrada.
- **Passos:** revisar campeão/classificação; publicar resultado final; finalizar torneio.
- **Erros possíveis:** partidas pendentes; disputas abertas; ranking ambíguo sem decisão.
- **Estado final:** status `finished`.

